import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    turbo: false, // ❌ ปิดการใช้ turbopack ใน prod
  }
}

export default nextConfig;
