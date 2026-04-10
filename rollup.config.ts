import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import { getFiles } from './scripts/buildUtils'
import json from '@rollup/plugin-json'

export default {
  input: ['./src/index.ts', ...getFiles('./src/components', ['.js', '.ts', '.jsx', '.tsx'])],
  onwarn(warning, warn) {
    if (
      warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
      warning.message?.includes(`'use client' was ignored`)
    ) {
      return
    }

    warn(warning)
  },
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
    json({
      include: ['public/locales/**/*.json', 'package.json'],
      compact: true
    }),
    resolve({
      browser: true,
      preferBuiltins: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      compilerOptions: {
        allowJs: false,
      },
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/*.widget.{js,jsx,ts,tsx}',
        'src/stories/**',
        'src/tests/**',
        'node_modules',
        'dist',
        'src/lib/webrtc/janus.js',
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
