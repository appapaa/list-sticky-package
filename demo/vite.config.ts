import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            'list-sticky': path.resolve(__dirname, '../src/list-sticky.ts'),
        },
    },
    server: {
        open: true,
    },
});