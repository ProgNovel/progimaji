import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel'
import typescript from 'rollup-plugin-typescript2'

const extensions = [
  '.js', '.jsx', '.ts', '.tsx', '.d.ts'
];

export default {
  input: 'src/index.ts',
  external: [],
  plugins: [
    resolve({ extensions }),
    commonjs(),
    typescript(),
    babel({ extensions, babelHelpers: "bundled", include: ['src/**/*'] }),
  ],
  output: {
    file: 'dist/main.js',
    format: 'cjs'
  }
};
