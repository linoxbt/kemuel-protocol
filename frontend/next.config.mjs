/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // @rainbow-me/rainbowkit -> wagmi's Base Account connector pulls in
    // @coinbase/cdp-sdk, which has optional dynamic imports for the x402
    // payment protocol that we don't use and haven't installed. Alias them
    // to false (an empty module) rather than installing unused deps —
    // standard Next.js/webpack technique for excluding optional branches.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@x402/evm/upto/client': false,
      '@x402/evm/exact/client': false,
      '@x402/core/client': false,
      '@x402/svm/exact/client': false,
      '@x402/evm': false,
    };
    return config;
  },
};

export default nextConfig;
