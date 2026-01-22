import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { readFileSync } from 'fs';

// Use readFileSync to read package.json
const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);

// Configuration for watch mode
const watchConfig = {
  clearScreen: false,
  buildDelay: 100
};

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/__tests__/**', '**/*.test.ts', '**/tests/**'],
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src'
    }),
    terser()
  ],
  external: [
    'axios', 
    'zod', 
    'https', 
    'http', 
    'fs', 
    'path', 
    'crypto',
    'buffer',
    'util'
  ],
  watch: watchConfig
};