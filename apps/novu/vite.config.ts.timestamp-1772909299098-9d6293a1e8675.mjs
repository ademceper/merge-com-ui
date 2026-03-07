// vite.config.ts
import { sentryVitePlugin } from "file:///Users/ademceper/Desktop/merge-com/ui/node_modules/.bun/@sentry+vite-plugin@2.23.1/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import tailwindcss from "file:///Users/ademceper/Desktop/merge-com/ui/node_modules/.bun/@tailwindcss+vite@4.2.1+4f50b975d820cbe5/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///Users/ademceper/Desktop/merge-com/ui/node_modules/.bun/@vitejs+plugin-react@4.7.0+4f50b975d820cbe5/node_modules/@vitejs/plugin-react/dist/index.js";
import { oidcSpa } from "file:///Users/ademceper/Desktop/merge-com/ui/node_modules/.bun/oidc-spa@10.0.7+c1e41fe186ebc661/node_modules/oidc-spa/esm/vite-plugin/index.mjs";
import path from "path";
import { defineConfig, loadEnv } from "file:///Users/ademceper/Desktop/merge-com/ui/node_modules/.bun/vite@5.4.21+2d0fe9de801fc453/node_modules/vite/dist/node/index.js";
import { ViteEjsPlugin } from "file:///Users/ademceper/Desktop/merge-com/ui/node_modules/.bun/vite-plugin-ejs@1.7.0+4f50b975d820cbe5/node_modules/vite-plugin-ejs/index.js";
var __vite_injected_original_dirname = "/Users/ademceper/Desktop/merge-com/ui/apps/novu";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      oidcSpa(),
      tailwindcss(),
      ViteEjsPlugin((viteConfig) => ({
        env: viteConfig.env
      })),
      react(),
      ...env.SENTRY_AUTH_TOKEN ? [
        sentryVitePlugin({
          org: env.SENTRY_ORG,
          project: env.SENTRY_PROJECT,
          authToken: env.SENTRY_AUTH_TOKEN,
          reactComponentAnnotation: { enabled: true },
          sourcemaps: {
            assets: "./dist/**",
            filesToDeleteAfterUpload: ["**/*.js.map"]
          },
          telemetry: false
        })
      ] : []
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "react-resizable-panels": path.resolve(__vite_injected_original_dirname, "../../packages/ui/node_modules/react-resizable-panels"),
        "prettier/standalone": path.resolve(__vite_injected_original_dirname, "./node_modules/prettier/standalone.js"),
        "prettier/plugins/html": path.resolve(__vite_injected_original_dirname, "./node_modules/prettier/plugins/html.js"),
        prettier: path.resolve(__vite_injected_original_dirname, "./node_modules/prettier/standalone.js")
      }
    },
    server: {
      port: 4201,
      headers: {
        "Document-Policy": "js-profiling"
      }
    },
    optimizeDeps: {
      include: ["@novu/api"]
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 12e3,
      commonjsOptions: {
        include: [/@novu\/api/, /node_modules/]
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWRlbWNlcGVyL0Rlc2t0b3AvbWVyZ2UtY29tL3VpL2FwcHMvbm92dVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FkZW1jZXBlci9EZXNrdG9wL21lcmdlLWNvbS91aS9hcHBzL25vdnUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FkZW1jZXBlci9EZXNrdG9wL21lcmdlLWNvbS91aS9hcHBzL25vdnUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSAnQHNlbnRyeS92aXRlLXBsdWdpbic7XG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB7IG9pZGNTcGEgfSBmcm9tICdvaWRjLXNwYS92aXRlLXBsdWdpbic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgVml0ZUVqc1BsdWdpbiB9IGZyb20gJ3ZpdGUtcGx1Z2luLWVqcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICBvaWRjU3BhKCksXG4gICAgICB0YWlsd2luZGNzcygpLFxuICAgICAgVml0ZUVqc1BsdWdpbigodml0ZUNvbmZpZykgPT4gKHtcbiAgICAgICAgZW52OiB2aXRlQ29uZmlnLmVudixcbiAgICAgIH0pKSxcbiAgICAgIHJlYWN0KCksXG4gICAgICAuLi4oZW52LlNFTlRSWV9BVVRIX1RPS0VOXG4gICAgICAgID8gW1xuICAgICAgICAgICAgc2VudHJ5Vml0ZVBsdWdpbih7XG4gICAgICAgICAgICAgIG9yZzogZW52LlNFTlRSWV9PUkcsXG4gICAgICAgICAgICAgIHByb2plY3Q6IGVudi5TRU5UUllfUFJPSkVDVCxcbiAgICAgICAgICAgICAgYXV0aFRva2VuOiBlbnYuU0VOVFJZX0FVVEhfVE9LRU4sXG4gICAgICAgICAgICAgIHJlYWN0Q29tcG9uZW50QW5ub3RhdGlvbjogeyBlbmFibGVkOiB0cnVlIH0sXG4gICAgICAgICAgICAgIHNvdXJjZW1hcHM6IHtcbiAgICAgICAgICAgICAgICBhc3NldHM6ICcuL2Rpc3QvKionLFxuICAgICAgICAgICAgICAgIGZpbGVzVG9EZWxldGVBZnRlclVwbG9hZDogWycqKi8qLmpzLm1hcCddLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0ZWxlbWV0cnk6IGZhbHNlLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgXVxuICAgICAgICA6IFtdKSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICAgICdyZWFjdC1yZXNpemFibGUtcGFuZWxzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3VpL25vZGVfbW9kdWxlcy9yZWFjdC1yZXNpemFibGUtcGFuZWxzJyksXG4gICAgICAgICdwcmV0dGllci9zdGFuZGFsb25lJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vbm9kZV9tb2R1bGVzL3ByZXR0aWVyL3N0YW5kYWxvbmUuanMnKSxcbiAgICAgICAgJ3ByZXR0aWVyL3BsdWdpbnMvaHRtbCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL25vZGVfbW9kdWxlcy9wcmV0dGllci9wbHVnaW5zL2h0bWwuanMnKSxcbiAgICAgICAgcHJldHRpZXI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL25vZGVfbW9kdWxlcy9wcmV0dGllci9zdGFuZGFsb25lLmpzJyksXG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiA0MjAxLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnRG9jdW1lbnQtUG9saWN5JzogJ2pzLXByb2ZpbGluZycsXG4gICAgICB9LFxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbJ0Bub3Z1L2FwaSddLFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTIwMDAsXG4gICAgICBjb21tb25qc09wdGlvbnM6IHtcbiAgICAgICAgaW5jbHVkZTogWy9Abm92dVxcL2FwaS8sIC9ub2RlX21vZHVsZXMvXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErVCxTQUFTLHdCQUF3QjtBQUNoVyxPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sVUFBVTtBQUNqQixTQUFTLGNBQWMsZUFBZTtBQUN0QyxTQUFTLHFCQUFxQjtBQU45QixJQUFNLG1DQUFtQztBQVF6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFFM0MsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsUUFBUTtBQUFBLE1BQ1IsWUFBWTtBQUFBLE1BQ1osY0FBYyxDQUFDLGdCQUFnQjtBQUFBLFFBQzdCLEtBQUssV0FBVztBQUFBLE1BQ2xCLEVBQUU7QUFBQSxNQUNGLE1BQU07QUFBQSxNQUNOLEdBQUksSUFBSSxvQkFDSjtBQUFBLFFBQ0UsaUJBQWlCO0FBQUEsVUFDZixLQUFLLElBQUk7QUFBQSxVQUNULFNBQVMsSUFBSTtBQUFBLFVBQ2IsV0FBVyxJQUFJO0FBQUEsVUFDZiwwQkFBMEIsRUFBRSxTQUFTLEtBQUs7QUFBQSxVQUMxQyxZQUFZO0FBQUEsWUFDVixRQUFRO0FBQUEsWUFDUiwwQkFBMEIsQ0FBQyxhQUFhO0FBQUEsVUFDMUM7QUFBQSxVQUNBLFdBQVc7QUFBQSxRQUNiLENBQUM7QUFBQSxNQUNILElBQ0EsQ0FBQztBQUFBLElBQ1A7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxRQUNwQywwQkFBMEIsS0FBSyxRQUFRLGtDQUFXLHVEQUF1RDtBQUFBLFFBQ3pHLHVCQUF1QixLQUFLLFFBQVEsa0NBQVcsdUNBQXVDO0FBQUEsUUFDdEYseUJBQXlCLEtBQUssUUFBUSxrQ0FBVyx5Q0FBeUM7QUFBQSxRQUMxRixVQUFVLEtBQUssUUFBUSxrQ0FBVyx1Q0FBdUM7QUFBQSxNQUMzRTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxRQUNQLG1CQUFtQjtBQUFBLE1BQ3JCO0FBQUEsSUFDRjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLFdBQVc7QUFBQSxJQUN2QjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsV0FBVztBQUFBLE1BQ1gsdUJBQXVCO0FBQUEsTUFDdkIsaUJBQWlCO0FBQUEsUUFDZixTQUFTLENBQUMsY0FBYyxjQUFjO0FBQUEsTUFDeEM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
