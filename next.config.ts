import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tambahkan baris di bawah ini
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;