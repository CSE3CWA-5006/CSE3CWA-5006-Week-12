import csv
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path


# ============================================================
# Config
# ============================================================

ROSTER_FILES = [
    "5006.txt",
    "3CWA.txt",
]


# ============================================================
# Basic command helpers
# ============================================================

def run_cmd(args, cwd=None, capture=True, check=True, input_text=None):
    """
    Run command safely without shell=True.
    Returns stdout text if capture=True.
    """
    try:
        result = subprocess.run(
            args,
            cwd=cwd,
            input=input_text,
            text=True,
            capture_output=capture,
            check=check,
            encoding="utf-8",
            errors="replace"
        )
        return result.stdout.strip() if capture else ""
    except subprocess.CalledProcessError as e:
        print("\nCommand failed:")
        print(" ".join(args))

        if e.stdout:
            print("\nSTDOUT:")
            print(e.stdout)

        if e.stderr:
            print("\nSTDERR:")
            print(e.stderr)

        if check:
            raise

        return ""


def pause():
    input("\nPress Enter to return to main menu...")


def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")


def require_tools():
    """
    Check git, gh, and GitHub CLI login.
    """
    missing = []

    for tool in ["gh", "git"]:
        try:
            run_cmd([tool, "--version"], check=True)
        except Exception:
            missing.append(tool)

    if missing:
        print("Missing required tools:", ", ".join(missing))
        print("Please install Git and GitHub CLI first.")
        sys.exit(1)

    try:
        run_cmd(["gh", "auth", "status"], check=True)
    except Exception:
        print("GitHub CLI is not logged in.")
        print("Run this first:")
        print("  gh auth login")
        sys.exit(1)


def ensure_git_identity():
    """
    Ensure git user.name and user.email are configured.
    This prevents: Author identity unknown.
    """
    name = run_cmd(["git", "config", "--global", "user.name"], check=False)
    email = run_cmd(["git", "config", "--global", "user.email"], check=False)

    if name and email:
        return

    print("Git author identity is not configured.")
    print("Git needs user.name and user.email before it can commit.")
    print()

    if not name:
        name = input("Enter Git user.name, e.g. Shuo Ding: ").strip()
        if name:
            run_cmd(["git", "config", "--global", "user.name", name], capture=False)

    if not email:
        email = input("Enter Git user.email, e.g. s.ding@latrobe.edu.au: ").strip()
        if email:
            run_cmd(["git", "config", "--global", "user.email", email], capture=False)

    print("Git identity configured.")


def get_current_user():
    return run_cmd(["gh", "api", "user", "--jq", ".login"])


def gh_api_paginated(endpoint):
    """
    Fetch paginated GitHub API results through gh.
    Returns merged list.
    """
    out = run_cmd(["gh", "api", "--paginate", "--slurp", endpoint])

    if not out:
        return []

    data = json.loads(out)
    merged = []

    for page in data:
        if isinstance(page, list):
            merged.extend(page)
        else:
            merged.append(page)

    return merged


# ============================================================
# Selection helpers
# ============================================================

def print_numbered(items, formatter):
    if not items:
        print("No items found.")
        return

    for i, item in enumerate(items, start=1):
        print(f"{i:>3}. {formatter(item)}")


def parse_selection(text, max_number):
    """
    Supports:
      1
      1,3,5
      1-4
      1,3-5,8
      all
      exit
    Returns:
      "exit", "all", or sorted list of zero-based indexes.
    """
    text = text.strip().lower()

    if text in ["exit", "e", "q", "quit", "back"]:
        return "exit"

    if text == "all":
        return "all"

    selected = set()
    parts = [p.strip() for p in text.split(",") if p.strip()]

    if not parts:
        raise ValueError("Empty selection.")

    for part in parts:
        if "-" in part:
            left, right = part.split("-", 1)

            if not left.isdigit() or not right.isdigit():
                raise ValueError("Invalid range.")

            start = int(left)
            end = int(right)

            if start > end:
                start, end = end, start

            for n in range(start, end + 1):
                if 1 <= n <= max_number:
                    selected.add(n - 1)
                else:
                    raise ValueError(f"Number out of range: {n}")

        else:
            if not part.isdigit():
                raise ValueError("Invalid selection.")

            n = int(part)

            if 1 <= n <= max_number:
                selected.add(n - 1)
            else:
                raise ValueError(f"Number out of range: {n}")

    return sorted(selected)


def ask_selection(max_number, allow_all=True):
    while True:
        prompt = "Choose number/range"

        if allow_all:
            prompt += ", all"

        prompt += ", or exit: "

        text = input(prompt).strip()

        try:
            result = parse_selection(text, max_number)

            if result == "all" and not allow_all:
                print("All is not allowed here.")
                continue

            return result

        except ValueError as e:
            print(f"Invalid input: {e}")


def confirm_strong(message, required_text):
    print("\nWARNING:", message)
    print(f"Type exactly this to confirm: {required_text}")
    typed = input("> ").strip()
    return typed == required_text


def safe_filename(name):
    bad = '<>:"/\\|?*'

    for ch in bad:
        name = name.replace(ch, "_")

    name = re.sub(r"\s+", "_", name)
    name = re.sub(r"_+", "_", name)
    return name.strip("_")


def simple_progress(current, total, label="Progress"):
    width = 30
    done = int(width * current / total) if total else width
    bar = "#" * done + "-" * (width - done)
    percent = int(100 * current / total) if total else 100

    print(
        f"\r{label}: [{bar}] {percent}% ({current}/{total})",
        end="",
        flush=True
    )

    if current >= total:
        print()


# ============================================================
# Workspace / Org mode
# ============================================================

def list_my_orgs():
    """
    List organizations that logged-in user belongs to.
    """
    out = run_cmd(["gh", "org", "list", "--limit", "100"], check=False)

    orgs = []

    for line in out.splitlines():
        name = line.strip()
        if name:
            orgs.append(name)

    return orgs


def choose_workspace(current_user):
    """
    Choose personal account or organization workspace.
    Later repo operations use this selected owner.
    """
    while True:
        clear_screen()
        print("========================================")
        print("Choose GitHub Workspace")
        print("========================================")
        print()
        print(f"1. Personal account: {current_user}")

        orgs = list_my_orgs()

        for i, org in enumerate(orgs, start=2):
            print(f"{i}. Organization: {org}")

        print("0. Exit program")
        print()

        choice = input("Choose workspace: ").strip()

        if choice == "0":
            print("Program finished.")
            sys.exit(0)

        if choice == "1":
            return {
                "mode": "personal",
                "owner": current_user,
                "label": f"Personal account: {current_user}"
            }

        if choice.isdigit():
            idx = int(choice)
            org_index = idx - 2

            if 0 <= org_index < len(orgs):
                org = orgs[org_index]

                return {
                    "mode": "org",
                    "owner": org,
                    "label": f"Organization: {org}"
                }

        print("Invalid choice.")
        pause()


# ============================================================
# GitHub repo listing functions
# ============================================================

def list_workspace_repos(workspace):
    """
    List repos owned by selected workspace.
    Personal mode:
      repos owned by current user.
    Org mode:
      repos owned by selected org.
    """
    owner = workspace["owner"]

    if workspace["mode"] == "personal":
        repos = gh_api_paginated(
            "/user/repos?affiliation=owner&per_page=100&sort=full_name"
        )

        result = []
        seen = set()

        for repo in repos:
            repo_owner = repo.get("owner", {}).get("login", "")
            full_name = repo.get("full_name", "")

            if repo_owner.lower() != owner.lower():
                continue

            if full_name in seen:
                continue

            seen.add(full_name)
            result.append(repo)

        result.sort(key=lambda r: r.get("full_name", "").lower())
        return result

    repos = gh_api_paginated(
        f"/orgs/{owner}/repos?per_page=100&sort=full_name"
    )

    repos.sort(key=lambda r: r.get("full_name", "").lower())
    return repos


def list_invited_repos_only(current_user, workspace=None):
    """
    List repos that are likely invited/collaborator repos only.

    Excludes:
    - repos owned by current GitHub login
    - repos owned by current selected workspace owner
    - repos owned by orgs that the user belongs to

    This is intended for student repos or repos where someone else invited you.
    """
    repos = gh_api_paginated(
        "/user/repos?affiliation=collaborator&per_page=100&sort=full_name"
    )

    my_owners = set()
    my_owners.add(current_user.lower())

    if workspace:
        my_owners.add(workspace["owner"].lower())

    try:
        for org in list_my_orgs():
            my_owners.add(org.lower())
    except Exception:
        pass

    # Optional manual exclusions. Add other account names here if needed.
    manual_excluded_owners = [
        # "shuo-ding",
    ]

    for owner in manual_excluded_owners:
        my_owners.add(owner.lower())

    result = []
    seen = set()

    for repo in repos:
        owner = repo.get("owner", {}).get("login", "")
        full_name = repo.get("full_name", "")

        if not full_name:
            continue

        if owner.lower() in my_owners:
            continue

        if full_name in seen:
            continue

        seen.add(full_name)
        result.append(repo)

    result.sort(key=lambda r: r.get("full_name", "").lower())
    return result


def repo_exists(full_name):
    result = subprocess.run(
        ["gh", "repo", "view", full_name],
        text=True,
        capture_output=True,
        encoding="utf-8",
        errors="replace"
    )
    return result.returncode == 0


def relist_workspace_repos(workspace):
    print("\nCurrent repos in workspace after operation:")

    repos = list_workspace_repos(workspace)

    if not repos:
        print("No repos found.")
        return

    for i, repo in enumerate(repos, start=1):
        private = "PRIVATE" if repo.get("private") else "PUBLIC"
        pushed_at = repo.get("pushed_at", "")
        print(f"{i:>3}. {repo.get('full_name')} | {private} | pushed: {pushed_at}")


# ============================================================
# Roster loading and matching
# ============================================================

def normalize_header_name(name):
    """
    Normalize roster column names:
    'Student Code' -> 'student_code'
    """
    name = name.strip().lower()
    name = re.sub(r"[^a-z0-9]+", "_", name)
    name = re.sub(r"_+", "_", name)
    return name.strip("_")


def detect_delimiter(header_line):
    """
    The roster examples are tab-separated.
    This also supports comma-separated files if needed.
    """
    if "\t" in header_line:
        return "\t"
    if "," in header_line:
        return ","
    return None


def read_roster_file(path):
    """
    Read one roster txt/csv file.

    Expected columns:
      Student Code
      Last Name
      First Name
      Activity Group
      Activity Code
      Course

    Returns list of student dicts.
    """
    path = Path(path)

    if not path.exists():
        print(f"Roster file not found: {path}")
        return []

    try:
        text = path.read_text(encoding="utf-8-sig", errors="replace")
    except Exception as e:
        print(f"Failed to read roster file {path}: {e}")
        return []

    lines = [line.rstrip("\n\r") for line in text.splitlines() if line.strip()]

    if not lines:
        print(f"Roster file is empty: {path}")
        return []

    delimiter = detect_delimiter(lines[0])

    students = []

    if delimiter:
        reader = csv.DictReader(lines, delimiter=delimiter)
        reader.fieldnames = [normalize_header_name(h) for h in reader.fieldnames]

        for row in reader:
            clean = {}
            for k, v in row.items():
                clean[normalize_header_name(k)] = (v or "").strip()

            student = build_student_record(clean, path.name)
            if student:
                students.append(student)

    else:
        # Fallback for whitespace-separated data.
        # This is less reliable when names contain spaces, so tab-separated roster is recommended.
        print(f"Warning: Could not detect delimiter in {path}. Trying whitespace fallback.")
        header = re.split(r"\s{2,}|\t", lines[0].strip())
        header = [normalize_header_name(h) for h in header]

        for line in lines[1:]:
            parts = re.split(r"\s{2,}|\t", line.strip())
            row = {}

            for i, h in enumerate(header):
                row[h] = parts[i].strip() if i < len(parts) else ""

            student = build_student_record(row, path.name)
            if student:
                students.append(student)

    print(f"Loaded {len(students)} students from {path.name}")
    return students


def build_student_record(row, source_file):
    """
    Convert roster row into standard student dict.
    """
    student_code = (
        row.get("student_code")
        or row.get("student_id")
        or row.get("id")
        or ""
    ).strip()

    student_code = re.sub(r"\D", "", student_code)

    if not student_code:
        return None

    last_name = row.get("last_name", "").strip()
    first_name = row.get("first_name", "").strip()
    activity_group = row.get("activity_group", "").strip()
    activity_code = row.get("activity_code", "").strip()
    course = row.get("course", "").strip()

    full_name = f"{last_name} {first_name}".strip()

    return {
        "student_code": student_code,
        "last_name": last_name,
        "first_name": first_name,
        "full_name": full_name,
        "activity_group": activity_group,
        "activity_code": activity_code,
        "course": course,
        "source_file": source_file,
    }


def load_all_rosters():
    """
    Load all configured roster files from current working directory.
    """
    all_students = []
    seen_keys = set()

    print("\nLoading roster files...")

    for filename in ROSTER_FILES:
        students = read_roster_file(filename)

        for student in students:
            # Keep both courses if the same student appears in both files.
            key = (student["student_code"], student["source_file"])
            if key in seen_keys:
                continue
            seen_keys.add(key)
            all_students.append(student)

    if all_students:
        print(f"Total students loaded: {len(all_students)}")
    else:
        print("No students loaded from roster files.")

    return all_students


def repo_match_text(repo):
    """
    Build searchable text from repo fields.
    """
    owner = repo.get("owner", {}).get("login", "")
    repo_name = repo.get("name", "")
    full_name = repo.get("full_name", "")

    return " ".join([owner, repo_name, full_name]).lower()


def match_repo_to_students(repo, students):
    """
    Match repo to students when student_code appears inside:
    - owner username
    - repo name
    - full repo name

    Returns:
      {
        match_status: MATCHED / NOT_MATCHED / MULTIPLE_MATCHES
        matches: [student dicts]
        match_basis: text
      }
    """
    text = repo_match_text(repo)

    matches = []

    for student in students:
        code = student["student_code"].lower()
        if code and code in text:
            matches.append(student)

    if not matches:
        return {
            "match_status": "NOT_MATCHED",
            "matches": [],
            "match_basis": "student_code not found in repo owner/name/full_name"
        }

    if len(matches) == 1:
        return {
            "match_status": "MATCHED",
            "matches": matches,
            "match_basis": "student_code found in repo owner/name/full_name"
        }

    return {
        "match_status": "MULTIPLE_MATCHES",
        "matches": matches,
        "match_basis": "multiple student_codes found in repo owner/name/full_name"
    }


def student_info_for_summary(match_result):
    """
    Convert match result to summary CSV fields.
    Multiple matches are joined with semicolon.
    """
    matches = match_result["matches"]

    if not matches:
        return {
            "matched_student_code": "",
            "matched_last_name": "",
            "matched_first_name": "",
            "matched_full_name": "",
            "matched_activity_group": "",
            "matched_activity_code": "",
            "matched_course": "",
            "matched_source_file": "",
            "match_status": match_result["match_status"],
            "match_basis": match_result["match_basis"],
        }

    return {
        "matched_student_code": ";".join(s["student_code"] for s in matches),
        "matched_last_name": ";".join(s["last_name"] for s in matches),
        "matched_first_name": ";".join(s["first_name"] for s in matches),
        "matched_full_name": ";".join(s["full_name"] for s in matches),
        "matched_activity_group": ";".join(s["activity_group"] for s in matches),
        "matched_activity_code": ";".join(s["activity_code"] for s in matches),
        "matched_course": ";".join(s["course"] for s in matches),
        "matched_source_file": ";".join(s["source_file"] for s in matches),
        "match_status": match_result["match_status"],
        "match_basis": match_result["match_basis"],
    }


def get_zip_filename_for_repo(repo, match_result):
    """
    If matched:
      21830993__AL_DALI_Imad__githubuser__RepoName.zip

    If not matched:
      githubuser__RepoName.zip
    """
    owner = repo.get("owner", {}).get("login", "unknown_owner")
    repo_name = repo.get("name", "unknown_repo")

    matches = match_result.get("matches", [])

    if len(matches) == 1:
        student = matches[0]
        name_part = f"{student['last_name']}_{student['first_name']}".strip("_")
        raw = f"{student['student_code']}__{name_part}__{owner}__{repo_name}.zip"
        return safe_filename(raw)

    if len(matches) > 1:
        codes = "_".join(s["student_code"] for s in matches)
        raw = f"MULTIPLE_MATCHES_{codes}__{owner}__{repo_name}.zip"
        return safe_filename(raw)

    raw = f"{owner}__{repo_name}.zip"
    return safe_filename(raw)


def write_no_lodgement_csv(students, matched_student_keys, output_dir):
    """
    Write no-lodgement.csv:
    students loaded from roster but not matched to any downloaded repo.
    matched_student_keys uses (student_code, source_file).
    """
    csv_path = Path(output_dir) / "no-lodgement.csv"

    fieldnames = [
        "student_code",
        "last_name",
        "first_name",
        "full_name",
        "activity_group",
        "activity_code",
        "course",
        "source_file",
        "reason"
    ]

    rows = []

    for student in students:
        key = (student["student_code"], student["source_file"])

        if key not in matched_student_keys:
            rows.append({
                "student_code": student["student_code"],
                "last_name": student["last_name"],
                "first_name": student["first_name"],
                "full_name": student["full_name"],
                "activity_group": student["activity_group"],
                "activity_code": student["activity_code"],
                "course": student["course"],
                "source_file": student["source_file"],
                "reason": "No matching invited GitHub repository found"
            })

    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"No-lodgement CSV saved: {csv_path}")
    print(f"No-lodgement count: {len(rows)}")


# ============================================================
# Filters and summaries
# ============================================================

def ask_filter_keyword():
    """
    Ask for assignment/repo keyword filter.
    Empty means no filter.
    """
    keyword = input(
        "Filter by assignment/repo keyword, Enter for no filter, or exit: "
    ).strip()

    if keyword.lower() in ["exit", "q", "quit", "back"]:
        return "exit"

    return keyword


def filter_repos_by_keyword(repos, keyword):
    """
    Filter repos by keyword in full_name or name.
    Case-insensitive.
    """
    if not keyword:
        return repos

    k = keyword.lower()

    return [
        repo for repo in repos
        if k in repo.get("full_name", "").lower()
        or k in repo.get("name", "").lower()
    ]


def get_student_key_from_repo(repo):
    """
    Fallback identifier:
    GitHub API reliably provides owner login.
    """
    owner = repo.get("owner", {}).get("login", "unknown_owner")
    repo_name = repo.get("name", "unknown_repo")
    return safe_filename(f"{owner}__{repo_name}")


def write_summary_csv(summary_rows, output_dir):
    csv_path = Path(output_dir) / "summary.csv"

    fieldnames = [
        "student_or_owner",
        "repo_name",
        "full_name",
        "visibility",
        "is_fork",
        "default_branch",
        "updated_at",
        "pushed_at",
        "zip_file",
        "status",
        "message",
        "download_time",

        "matched_student_code",
        "matched_last_name",
        "matched_first_name",
        "matched_full_name",
        "matched_activity_group",
        "matched_activity_code",
        "matched_course",
        "matched_source_file",
        "match_status",
        "match_basis",
    ]

    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(summary_rows)

    print(f"\nSummary CSV saved: {csv_path}")


# ============================================================
# ZIP download and backup helpers
# ============================================================

def download_repo_zip_with_summary(repo, output_dir, students=None):
    """
    Download one repo as ZIP and return:
      summary_row, matched_student_keys

    ZIP filename includes real student information if roster match is found.
    """
    students = students or []

    full_name = repo["full_name"]
    repo_name = repo.get("name", "unknown_repo")
    owner = repo.get("owner", {}).get("login", "unknown_owner")
    default_branch = repo.get("default_branch") or "main"

    match_result = match_repo_to_students(repo, students)
    student_summary = student_info_for_summary(match_result)

    filename = get_zip_filename_for_repo(repo, match_result)
    output_path = Path(output_dir) / filename

    endpoint = f"/repos/{full_name}/zipball/{default_branch}"

    row = {
        "student_or_owner": owner,
        "repo_name": repo_name,
        "full_name": full_name,
        "visibility": "PRIVATE" if repo.get("private") else "PUBLIC",
        "is_fork": "YES" if repo.get("fork") else "NO",
        "default_branch": default_branch,
        "updated_at": repo.get("updated_at", ""),
        "pushed_at": repo.get("pushed_at", ""),
        "zip_file": str(output_path),
        "status": "FAILED",
        "message": "",
        "download_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    row.update(student_summary)

    print(f"Downloading {full_name} -> {output_path}")
    print(f"Match status: {match_result['match_status']}")

    if match_result["matches"]:
        print("Matched student(s):")
        for student in match_result["matches"]:
            print(
                f" - {student['student_code']} | "
                f"{student['last_name']} {student['first_name']} | "
                f"{student['source_file']}"
            )

    with open(output_path, "wb") as f:
        result = subprocess.run(
            ["gh", "api", endpoint],
            stdout=f,
            stderr=subprocess.PIPE
        )

    matched_student_keys = set()

    if result.returncode != 0:
        error_msg = result.stderr.decode("utf-8", errors="replace")
        row["status"] = "FAILED"
        row["message"] = error_msg.strip()

        print(f"Failed to download {full_name}")
        print(error_msg)

        if output_path.exists():
            output_path.unlink()

    else:
        row["status"] = "SUCCESS"
        row["message"] = "Downloaded successfully"
        print(f"Saved: {output_path}")

        for student in match_result["matches"]:
            matched_student_keys.add((student["student_code"], student["source_file"]))

    return row, matched_student_keys


def backup_repo_before_destructive_action(repo, backup_dir):
    """
    Backup repo as ZIP before delete or clear.
    Returns backup file path or None.
    """
    Path(backup_dir).mkdir(parents=True, exist_ok=True)

    full_name = repo["full_name"]
    default_branch = repo.get("default_branch") or "main"

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = get_student_key_from_repo(repo) + f"__backup_{stamp}.zip"
    output_path = Path(backup_dir) / filename

    endpoint = f"/repos/{full_name}/zipball/{default_branch}"

    print(f"Backing up {full_name} -> {output_path}")

    with open(output_path, "wb") as f:
        result = subprocess.run(
            ["gh", "api", endpoint],
            stdout=f,
            stderr=subprocess.PIPE
        )

    if result.returncode != 0:
        error_msg = result.stderr.decode("utf-8", errors="replace")
        print(f"Backup failed for {full_name}")
        print(error_msg)

        if output_path.exists():
            output_path.unlink()

        return None

    print(f"Backup saved: {output_path}")
    return output_path


# ============================================================
# Local folder and git helpers
# ============================================================

def copy_folder_contents(src, dst):
    src = Path(src).resolve()
    dst = Path(dst).resolve()

    all_items = []

    for root, dirs, files in os.walk(src):
        root_path = Path(root)

        dirs[:] = [d for d in dirs if d != ".git"]

        for file in files:
            full = root_path / file
            rel = full.relative_to(src)
            all_items.append((full, dst / rel))

    total = len(all_items)

    if total == 0:
        print("No files found in selected folder.")
        return

    for i, (source_file, target_file) in enumerate(all_items, start=1):
        target_file.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_file, target_file)
        simple_progress(i, total, "Copying files")


def remove_repo_worktree_contents(repo_dir):
    repo_dir = Path(repo_dir)

    for item in repo_dir.iterdir():
        if item.name == ".git":
            continue

        if item.is_dir():
            shutil.rmtree(item)
        else:
            item.unlink()


def git_has_changes(repo_dir):
    out = run_cmd(["git", "status", "--porcelain"], cwd=repo_dir)
    return bool(out.strip())


def git_commit_push(repo_dir, message):
    run_cmd(["git", "add", "-A"], cwd=repo_dir)

    if not git_has_changes(repo_dir):
        print("No changes to commit.")
        return

    run_cmd(["git", "commit", "-m", message], cwd=repo_dir, capture=False)
    run_cmd(["git", "push"], cwd=repo_dir, capture=False)
    print("Done. Changes pushed successfully.")


# ============================================================
# Invitations
# ============================================================

def list_invitations():
    """
    GitHub repository invitations for authenticated user.
    GitHub usually only returns pending invitations here.
    """
    return gh_api_paginated("/user/repository_invitations?per_page=100")


def invitation_status(inv):
    return inv.get("state") or "pending"


def accept_invitation(invitation_id):
    run_cmd([
        "gh",
        "api",
        f"/user/repository_invitations/{invitation_id}",
        "-X",
        "PATCH"
    ])


def decline_invitation(invitation_id):
    run_cmd([
        "gh",
        "api",
        f"/user/repository_invitations/{invitation_id}",
        "-X",
        "DELETE"
    ])


# ============================================================
# Repo creation
# ============================================================

def create_repo(workspace):
    owner = workspace["owner"]

    while True:
        name = input("New repo name, or exit: ").strip()

        if name.lower() in ["exit", "q", "quit", "back"]:
            return

        if not name:
            print("Repo name cannot be empty.")
            continue

        full_name = f"{owner}/{name}"

        if repo_exists(full_name):
            print(f"Repo already exists: {full_name}")
            print("Please enter another repo name.")
            continue

        visibility = "private"
        ans = input("Private by default. Make it public instead? y/N: ").strip().lower()

        if ans == "y":
            visibility = "public"

        description = input("Description, optional: ").strip()

        args = ["gh", "repo", "create", full_name, f"--{visibility}"]

        if description:
            args += ["--description", description]

        run_cmd(args, capture=False)
        print(f"Created repo: {full_name} ({visibility})")
        return


# ============================================================
# Menu option 1
# ============================================================

def option_invitations():
    while True:
        clear_screen()
        print("=== Invitations ===")
        print("1. Show all invitations")
        print("2. Show pending invitations only")
        print("0. Return to main menu")

        choice = input("Choose: ").strip()

        if choice == "0":
            return

        if choice not in ["1", "2"]:
            print("Invalid option.")
            pause()
            continue

        invitations = list_invitations()

        if choice == "2":
            invitations = [
                inv for inv in invitations
                if invitation_status(inv).lower() == "pending"
            ]

        clear_screen()
        print("=== Invitation list ===")

        def fmt(inv):
            repo = inv.get("repository", {})
            repo_name = repo.get("full_name", "unknown")
            inviter = inv.get("inviter", {}).get("login", "unknown")
            status = invitation_status(inv)
            return f"{repo_name} | inviter: {inviter} | status: {status}"

        print_numbered(invitations, fmt)

        if not invitations:
            pause()
            continue

        print("\nChoose one invitation, then accept/decline/exit.")
        sel = ask_selection(len(invitations), allow_all=False)

        if sel == "exit":
            continue

        inv = invitations[sel[0]]
        repo_name = inv.get("repository", {}).get("full_name", "unknown")
        inv_id = inv.get("id")

        print(f"\nSelected: {repo_name}")
        action = input("Accept, decline, or exit? [a/d/e]: ").strip().lower()

        if action in ["e", "exit"]:
            continue

        if action == "a":
            accept_invitation(inv_id)
            print("Invitation accepted.")
            pause()
            continue

        if action == "d":
            decline_invitation(inv_id)
            print("Invitation declined.")
            pause()
            continue

        print("Invalid action.")
        pause()


# ============================================================
# Menu option 2
# ============================================================

def option_download_invited_repos(current_user, workspace):
    clear_screen()
    print("=== Invited / collaborator repos only ===")
    print("This list excludes your personal repos and your own org/course repos.")
    print(f"Current workspace: {workspace['label']}")
    print()

    students = load_all_rosters()

    repos = list_invited_repos_only(current_user, workspace)

    keyword = ask_filter_keyword()

    if keyword == "exit":
        return

    repos = filter_repos_by_keyword(repos, keyword)

    def fmt(repo):
        private = "PRIVATE" if repo.get("private") else "PUBLIC"
        fork = "FORK" if repo.get("fork") else "REPO"
        owner = repo.get("owner", {}).get("login", "unknown_owner")
        pushed_at = repo.get("pushed_at", "")

        match_result = match_repo_to_students(repo, students)
        match_status = match_result["match_status"]

        if match_result["matches"]:
            matched_text = "; ".join(
                f"{s['student_code']} {s['last_name']} {s['first_name']} [{s['source_file']}]"
                for s in match_result["matches"]
            )
        else:
            matched_text = "No roster match"

        return (
            f"{repo.get('full_name')} | "
            f"owner/student: {owner} | "
            f"{private} | {fork} | pushed: {pushed_at} | "
            f"{match_status}: {matched_text}"
        )

    print_numbered(repos, fmt)

    if not repos:
        print("\nNo invited/collaborator repos matched your filter.")
        pause()
        return

    print("\nChoose repos to download as ZIP.")
    print("Examples: 1, 1-5, 1,3-6, all, exit")

    sel = ask_selection(len(repos), allow_all=True)

    if sel == "exit":
        return

    selected = repos if sel == "all" else [repos[i] for i in sel]

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = Path.cwd() / f"student_assessment_{stamp}"
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nDownload folder: {output_dir}")

    summary_rows = []
    matched_student_keys = set()
    total = len(selected)

    for i, repo in enumerate(selected, start=1):
        print(f"\n[{i}/{total}]")
        row, keys = download_repo_zip_with_summary(repo, output_dir, students)
        summary_rows.append(row)
        matched_student_keys.update(keys)

    write_summary_csv(summary_rows, output_dir)

    if students:
        write_no_lodgement_csv(students, matched_student_keys, output_dir)
    else:
        print("No roster students loaded; no-lodgement.csv was not generated.")

    print("\nAll selected downloads finished.")
    pause()


# ============================================================
# Menu option 3
# ============================================================

def option_create_new_repo(workspace):
    clear_screen()
    print("=== Create new repo ===")
    print(f"Current workspace: {workspace['label']}")
    print()

    create_repo(workspace)
    pause()


# ============================================================
# Menu option 4
# ============================================================

def option_delete_workspace_repos(workspace):
    clear_screen()
    print("=== Delete repos in current workspace ===")
    print(f"Current workspace: {workspace['label']}")
    print()

    repos = list_workspace_repos(workspace)

    keyword = ask_filter_keyword()

    if keyword == "exit":
        return

    repos = filter_repos_by_keyword(repos, keyword)

    def fmt(repo):
        private = "PRIVATE" if repo.get("private") else "PUBLIC"
        pushed_at = repo.get("pushed_at", "")
        return f"{repo.get('full_name')} | {private} | pushed: {pushed_at}"

    print_numbered(repos, fmt)

    if not repos:
        print("\nNo repos matched your filter.")
        pause()
        return

    print("\nChoose repos to delete.")
    print("Examples: 1, 1-3, 1,4,6, exit")

    sel = ask_selection(len(repos), allow_all=False)

    if sel == "exit":
        return

    selected = [repos[i] for i in sel]

    print("\nSelected for deletion:")

    for repo in selected:
        print(" -", repo["full_name"])

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = Path.cwd() / f"backup_before_delete_{stamp}"

    print("\nBefore deletion, each selected repo will be backed up as ZIP.")
    print(f"Backup folder: {backup_dir}")
    print("\nThis operation deletes GitHub repositories.")
    print("You may need permission scope: delete_repo")
    print("If deletion fails, run:")
    print("  gh auth refresh -s delete_repo")

    if not confirm_strong(
        "Repository deletion is permanent, but local ZIP backups will be kept.",
        "DELETE SELECTED REPOS"
    ):
        print("Cancelled.")
        pause()
        return

    backup_records = []

    for repo in selected:
        full_name = repo["full_name"]

        print(f"\nProcessing {full_name}...")

        backup_path = backup_repo_before_destructive_action(repo, backup_dir)
        backup_records.append((full_name, backup_path))

        if backup_path is None:
            print(f"Skipping delete because backup failed: {full_name}")
            continue

        print(f"Deleting {full_name}...")
        run_cmd(["gh", "api", f"/repos/{full_name}", "-X", "DELETE"], capture=False)
        print(f"Deleted: {full_name}")

    print("\nBackup records:")

    for full_name, backup_path in backup_records:
        if backup_path:
            print(f" - {full_name} -> {backup_path}")
        else:
            print(f" - {full_name} -> BACKUP FAILED, NOT DELETED")

    relist_workspace_repos(workspace)
    pause()


# ============================================================
# Menu option 5
# ============================================================

def option_commit_folder_to_repo(workspace):
    clear_screen()
    print("=== Commit local folder to one repo ===")
    print(f"Current workspace: {workspace['label']}")
    print()

    repos = list_workspace_repos(workspace)

    keyword = ask_filter_keyword()

    if keyword == "exit":
        return

    repos = filter_repos_by_keyword(repos, keyword)

    def fmt(repo):
        private = "PRIVATE" if repo.get("private") else "PUBLIC"
        pushed_at = repo.get("pushed_at", "")
        return f"{repo.get('full_name')} | {private} | pushed: {pushed_at}"

    print_numbered(repos, fmt)

    if not repos:
        print("\nNo repos matched your filter.")
        pause()
        return

    print("\nChoose one repo only.")
    sel = ask_selection(len(repos), allow_all=False)

    if sel == "exit":
        return

    repo = repos[sel[0]]
    full_name = repo["full_name"]
    clone_url = repo.get("ssh_url") or repo.get("clone_url")

    folder = input("\nLocal folder path to commit, or exit: ").strip().strip('"')

    if folder.lower() in ["exit", "q", "quit", "back"]:
        return

    folder_path = Path(folder).expanduser().resolve()

    if not folder_path.exists() or not folder_path.is_dir():
        print("Folder does not exist or is not a directory.")
        pause()
        return

    print(f"\nSelected repo: {full_name}")
    print(f"Selected folder: {folder_path}")

    if not confirm_strong(
        "This will copy the selected local folder content into the repo, commit, and push.",
        "COMMIT TO REPO"
    ):
        print("Cancelled.")
        pause()
        return

    message = input("Commit message, Enter for default: ").strip()

    if not message:
        message = f"Update from local folder {folder_path.name}"

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)

        print(f"\nCloning {full_name}...")
        run_cmd(["git", "clone", clone_url, "repo"], cwd=tmp_path, capture=False)

        repo_dir = tmp_path / "repo"

        print("\nCopying local folder content into cloned repo...")
        copy_folder_contents(folder_path, repo_dir)

        print("\nCommitting and pushing...")
        git_commit_push(repo_dir, message)

    pause()


# ============================================================
# Menu option 6
# ============================================================

def option_clear_repo_content(workspace):
    clear_screen()
    print("=== Clear content of repos in current workspace ===")
    print(f"Current workspace: {workspace['label']}")
    print()

    repos = list_workspace_repos(workspace)

    keyword = ask_filter_keyword()

    if keyword == "exit":
        return

    repos = filter_repos_by_keyword(repos, keyword)

    def fmt(repo):
        private = "PRIVATE" if repo.get("private") else "PUBLIC"
        pushed_at = repo.get("pushed_at", "")
        return f"{repo.get('full_name')} | {private} | pushed: {pushed_at}"

    print_numbered(repos, fmt)

    if not repos:
        print("\nNo repos matched your filter.")
        pause()
        return

    print("\nChoose repos to clear content.")
    print("Examples: 1, 1-3, 1,4,6, exit")

    sel = ask_selection(len(repos), allow_all=False)

    if sel == "exit":
        return

    selected = [repos[i] for i in sel]

    print("\nSelected repos:")

    for repo in selected:
        print(" -", repo["full_name"])

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = Path.cwd() / f"backup_before_clear_{stamp}"

    print("\nBefore clearing, each selected repo will be backed up as ZIP.")
    print(f"Backup folder: {backup_dir}")
    print("\nThis will NOT delete the repo itself.")
    print("It will remove repo files, commit the empty state, and push.")

    if not confirm_strong(
        "This will clear all files from selected repos, but backup ZIP files will be kept.",
        "CLEAR SELECTED REPOS"
    ):
        print("Cancelled.")
        pause()
        return

    backup_records = []

    for repo in selected:
        full_name = repo["full_name"]
        clone_url = repo.get("ssh_url") or repo.get("clone_url")

        print(f"\nProcessing {full_name}...")

        backup_path = backup_repo_before_destructive_action(repo, backup_dir)
        backup_records.append((full_name, backup_path))

        if backup_path is None:
            print(f"Skipping clear because backup failed: {full_name}")
            continue

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)

            print(f"Cloning {full_name}...")
            run_cmd(["git", "clone", clone_url, "repo"], cwd=tmp_path, capture=False)

            repo_dir = tmp_path / "repo"

            print("Removing repo content, keeping .git...")
            remove_repo_worktree_contents(repo_dir)

            print("Committing and pushing clear operation...")
            git_commit_push(repo_dir, "Clear repository contents")

        print(f"Finished clearing: {full_name}")

    print("\nBackup records:")

    for full_name, backup_path in backup_records:
        if backup_path:
            print(f" - {full_name} -> {backup_path}")
        else:
            print(f" - {full_name} -> BACKUP FAILED, NOT CLEARED")

    relist_workspace_repos(workspace)
    pause()


# ============================================================
# Main program
# ============================================================

def main():
    require_tools()
    ensure_git_identity()

    current_user = get_current_user()
    workspace = choose_workspace(current_user)

    while True:
        clear_screen()
        print("========================================")
        print("GitHub Teaching Repository Manager")
        print("========================================")
        print(f"Logged in as: {current_user}")
        print(f"Current workspace: {workspace['label']}")
        print()
        print("1. List invitations, accept/decline")
        print("2. List invited/collaborator repos only, filter, download ZIPs, match roster")
        print("3. Create new repo in current workspace, private by default")
        print("4. List repos in current workspace and delete selected repos")
        print("5. List repos in current workspace and commit local folder to one repo")
        print("6. List repos in current workspace and clear content of selected repos")
        print("7. Change workspace")
        print("0. Exit program")
        print()

        choice = input("Choose option: ").strip()

        try:
            if choice == "1":
                option_invitations()

            elif choice == "2":
                option_download_invited_repos(current_user, workspace)

            elif choice == "3":
                option_create_new_repo(workspace)

            elif choice == "4":
                option_delete_workspace_repos(workspace)

            elif choice == "5":
                option_commit_folder_to_repo(workspace)

            elif choice == "6":
                option_clear_repo_content(workspace)

            elif choice == "7":
                workspace = choose_workspace(current_user)

            elif choice == "0":
                print("Program finished.")
                break

            else:
                print("Invalid option.")
                pause()

        except KeyboardInterrupt:
            print("\nCancelled by user.")
            pause()

        except Exception as e:
            print("\nError:")
            print(e)
            pause()


if __name__ == "__main__":
    main()