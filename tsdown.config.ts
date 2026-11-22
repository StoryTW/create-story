import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/cli.ts'],
  platform: 'node',
  format: 'esm',
  target: 'node22.18',
  fixedExtension: true,
  dts: false,
})
