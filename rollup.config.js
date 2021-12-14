import typescript from 'rollup-plugin-typescript2';

import {terser} from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';

import pkg from './package.json'

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true
    }
  ],
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  plugins: [
    postcss({
      plugins: [],
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    typescript(),
    terser() // minifies generated bundles
  ],
};
