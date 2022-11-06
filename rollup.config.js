import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'
import { getFiles } from './scripts/buildUtils'

const extensions = ['.js', '.ts', '.jsx', '.tsx']

export default {
  input: ['./src/index.ts', ...getFiles('./src/components', extensions)],
  output: {
    dir: 'dist',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      exclude: [
        '**/__tests__',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/__stories__',
        '**/*.stories.{js,jsx,ts,tsx}',
        '**/*.widget.{js,jsx,ts,tsx}'
      ],
    }),
    postcss(),
    terser(),
  ],
  external: ['react', 'react-dom'],
}
