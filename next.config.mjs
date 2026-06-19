/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_HERMES_API_URL: process.env.NEXT_PUBLIC_HERMES_API_URL || '/'
  }
};
