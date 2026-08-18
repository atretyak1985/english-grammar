import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Cloud Run: збірка кладе самодостатній сервер у .next/standalone
  output: 'standalone',
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // Тесеракт запускає власний worker і читає wasm-ядро з диска — бандлити його не можна.
  serverExternalPackages: ['tesseract.js'],
  // Ці файли тесеракт вимагає в рантаймі, тому трасування збірки їх не бачить.
  outputFileTracingIncludes: {
    '/api/extract': [
      './node_modules/tesseract.js/**',
      './node_modules/tesseract.js-core/**',
    ],
  },
};

const withMDX = createMDX({
  extension: /\.mdx$/,
});

export default withMDX(nextConfig);
