'use client';
// Avatar.jsx — a friendly PERSON avatar drawn as an SVG, seeded by the name so each
// user always looks the same.
//
// IMPORTANT: every colour is passed through ensureLight(), which uses the RGB
// luminance of the colour. Anything that is too dark (a "black-family" colour) is
// automatically lightened until it is clearly light, so an avatar can never come out
// black/dark — not the face, not the hair, not the background.
const BG   = ['#DBEAFE', '#FCE7F3', '#DCFCE7', '#FEF9C3', '#EDE9FE', '#FFEDD5', '#CCFBF1', '#FAE8FF'];
const SKIN = ['#FFE0BD', '#FBD7C0', '#F7D5B5', '#FFDFC4', '#FCE3D2', '#F3D9C6'];   // light tones only
const HAIR = ['#6B4226', '#8B5A2B', '#A0522D', '#C9883E', '#A78B71', '#7C3AED', '#B5651D'];

function hash(str) {
  let n = 0;
  for (const ch of String(str)) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  return n;
}

// Perceived brightness of a #rrggbb colour (0 = black, 255 = white).
function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
function lighten(hex, amt) {
  const ch = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(c + (255 - c) * amt).toString(16).padStart(2, '0');
  };
  return '#' + ch(1) + ch(3) + ch(5);
}
// Reject dark colours: keep lightening until the colour is at least `min` bright.
function ensureLight(hex, min) {
  let c = hex, guard = 0;
  while (luminance(c) < min && guard++ < 10) c = lighten(c, 0.3);
  return c;
}

export default function Avatar({ seed, size = 44 }) {
  const n = hash(seed || '?');
  const bg = ensureLight(BG[n % BG.length], 205);
  const skin = ensureLight(SKIN[(n >>> 4) % SKIN.length], 205);
  const hair = ensureLight(HAIR[(n >>> 8) % HAIR.length], 120); // never a black-family colour
  const style = (n >>> 12) % 3;          // 0 = full hair, 1 = full + bun, 2 = no hair
  const glasses = ((n >>> 15) % 4) === 0;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="avatar-svg" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill={bg} />
      {style !== 2 && <circle cx="32" cy="29" r="20" fill={hair} />}
      {style === 1 && <circle cx="32" cy="11" r="6" fill={hair} />}
      <circle cx="32" cy="35" r="18" fill={skin} />
      <circle cx="24" cy="40" r="2.4" fill="#F9A8A8" opacity="0.55" />
      <circle cx="40" cy="40" r="2.4" fill="#F9A8A8" opacity="0.55" />
      <circle cx="26" cy="34" r="2.4" fill="#2B2B2B" />
      <circle cx="38" cy="34" r="2.4" fill="#2B2B2B" />
      {glasses && (
        <g fill="none" stroke="#3A3A3A" strokeWidth="1.3">
          <circle cx="26" cy="34" r="4.6" /><circle cx="38" cy="34" r="4.6" /><path d="M30.6 34 H33.4" />
        </g>
      )}
      <path d="M26 41 Q32 46 38 41" fill="none" stroke="#B45B5B" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
