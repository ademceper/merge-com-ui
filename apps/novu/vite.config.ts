import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tailwindcss(),
      ViteEjsPlugin((viteConfig) => ({
        env: viteConfig.env,
      })),
      react(),
      ...(env.SENTRY_AUTH_TOKEN
        ? [
            sentryVitePlugin({
              org: env.SENTRY_ORG,
              project: env.SENTRY_PROJECT,
              authToken: env.SENTRY_AUTH_TOKEN,
              reactComponentAnnotation: { enabled: true },
              sourcemaps: {
                assets: './dist/**',
                filesToDeleteAfterUpload: ['**/*.js.map'],
              },
              telemetry: false,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@novu/shared': path.resolve(__dirname, './src/shared/src/index.ts'),
        '@clerk/clerk-react': path.resolve(__dirname, './src/utils/no-auth/index.tsx'),
        '@/components/side-navigation/organization-dropdown-clerk': path.resolve(
          __dirname,
          './src/utils/no-auth/organization-dropdown.tsx'
        ),
        '@': path.resolve(__dirname, './src'),
        'prettier/standalone': path.resolve(__dirname, './node_modules/prettier/standalone.js'),
        'prettier/plugins/html': path.resolve(__dirname, './node_modules/prettier/plugins/html.js'),
        prettier: path.resolve(__dirname, './node_modules/prettier/standalone.js'),
      },
    },
    server: {
      port: 4201,
      headers: {
        'Document-Policy': 'js-profiling',
      },
    },
    optimizeDeps: {
      include: ['@novu/api'],
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 12000,
      commonjsOptions: {
        include: [/@novu\/api/, /node_modules/],
      },
    },
  };
});
