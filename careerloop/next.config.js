/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// Next.js configuration (ESM, because package.json has "type": "module").
/** @type {import('next').NextConfig} */
const nextConfig = {
  // node:sqlite is a built-in Node module; keep it external so Next does not bundle it.
  serverExternalPackages: ['node:sqlite'],
  devIndicators: false, // hide the floating Next.js dev badge in the corner
};
export default nextConfig;
