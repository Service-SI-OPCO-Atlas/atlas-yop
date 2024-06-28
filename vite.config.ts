/// <reference types="vitest" />
import { resolve } from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "./src/index.ts"),
            name: "@dsid-opcoatlas/yop",
            fileName: (format) => `index.${format}.js`,
            formats: ["es"],
        },
        rollupOptions: {
            external: ["lodash-es"],
            output: {
                globals: {
                    lodash: "lodash-es",
                },
            },
        },
        sourcemap: true,
        emptyOutDir: true,
    },
    plugins: [dts({ rollupTypes: true })],
    test: {
        include: ['test/**/*.test.ts'],
    },
})