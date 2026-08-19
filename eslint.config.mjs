import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  // .design-verify — копії макета й артефакти звірки, не наш код
  { ignores: ['.next/**', 'node_modules/**', 'drizzle/**', 'next-env.d.ts', '.design-verify/**'] },
  ...coreWebVitals,
  ...typescript,
];

export default config;
