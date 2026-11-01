import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  poweredByHeader: false,
  allowedDevOrigins: ["pos.localhost"],
  outputFileTracingIncludes: { "/**": ["./db/**"] },
};

export default config;
