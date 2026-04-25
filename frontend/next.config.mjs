/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/**" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }
    ]
  },
  poweredByHeader: false,

  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
    const backendOrigin = apiBase.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");
    return [
      {
        source: "/media/:path*",
        destination: `${backendOrigin}/media/:path*`
      }
    ];
  }
};

export default nextConfig;
