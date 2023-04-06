import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    target: "es6",
})
