/// <reference types="vitest" />
import { resolve } from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import react from '@vitejs/plugin-react'

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
        },
        sourcemap: true,
        emptyOutDir: true,
    },
    plugins: [
        react({
            babel: {
                plugins: [
                    ["@babel/plugin-proposal-decorators", { version: "2023-11" }],
                ]
            }
        }),
        dts({ rollupTypes: true })
    ],
    test: {
        include: ['test/**/*.test.ts'],
    },
})