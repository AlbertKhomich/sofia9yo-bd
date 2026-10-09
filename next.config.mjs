/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/geheimcodes.html', destination: '/geheimcodes', permanent: true },
    ];
  },
};
export default nextConfig;
