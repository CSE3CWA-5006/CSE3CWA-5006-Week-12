// Next.js configuration (ESM, because package.json has "type": "module").
/** @type {import('next').NextConfig} */
const nextConfig = {
  // node:sqlite is a built-in Node module; keep it external so Next does not bundle it.
  serverExternalPackages: ['node:sqlite'],
  devIndicators: false, // hide the floating Next.js dev badge in the corner
};
export default nextConfig;
