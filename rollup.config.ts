import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import { getFiles } from './scripts/buildUtils'

export default {
  input: ['./src/index.ts', ...getFiles('./src/components', ['.js', '.ts', '.jsx', '.tsx'])],
  output: [
    {
      format: 'cjs',
      dir: 'dist',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'named',
    },
  ],
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      exclude: [
        'src/*.widget.{js,jsx,ts,tsx}',
        'src/stories/**',
        'src/tests/**',
        'node_modules',
        'dist',
        'lib/janus.js',
      ],
    }),
    babel({
      include: ['**.js', 'node_modules/**'],
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env'],
    }),
    postcss(),
    terser(),
  ],
  external: ['react', 'react-dom', 'react-scripts'],
}
