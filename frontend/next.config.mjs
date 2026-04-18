/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Same-origin /api and /static in the browser → proxied to FastAPI (no CORS, no localhost vs 127.0.0.1).
    // Use 127.0.0.1 so Node/uvicorn IPv4 matches (some setups fail with localhost → ::1).
    const backend = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/static/:path*", destination: `${backend}/static/:path*` },
    ];
  },
};

export default nextConfig;
