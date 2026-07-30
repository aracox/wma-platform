import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "192.168.1.37:8080",
    "192.168.1.37",
    "localhost:8080",
    "localhost"
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default withNextIntl(nextConfig);
