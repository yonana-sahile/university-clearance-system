import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  // Set DISABLE_HMR=true only if you really need to disable file watching
  // (e.g. running on a machine with slow I/O). Locally, leave it unset.
  const disableHmr = process.env.DISABLE_HMR === 'true';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 5173,
      host: true,
      hmr: !disableHmr,
      watch: disableHmr ? null : {},
    },
    // Pin every runtime dep so Vite doesn't re-optimize mid-session
    // and hand out 504s to already-open browser tabs.
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-router-dom',
        'antd',
        '@ant-design/icons',
        'lucide-react',
        'qrcode.react',
        'canvas-confetti',
      ],
    },
    build: {
      // Prevents a rare issue where Vite splits antd into multiple chunks
      // that hit each other during dev with `--force`.
      chunkSizeWarningLimit: 2000,
    },
  };
});
