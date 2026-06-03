import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/list-sticky.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: true,
    external: ['react', 'react-dom'],
    outExtension: ({ format }) => {
        return {
            js: `.${format === 'esm' ? 'es' : 'cjs'}.js`,
        }
    },
})
