// vite.config.ts
import { sentryVitePlugin } from "file:///Users/ademceper/Desktop/merge-com/ui/node_modules/.bun/@sentry+vite-plugin@2.23.1/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import tailwindcss from "file:///Users/ademceper/Desktop/merge-com/ui/node_modules/.bun/@tailwindcss+vite@4.2.1+4f50b975d820cbe5/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///Users/ademceper/Desktop/merge-com/ui/node_modules/.bun/@vitejs+plugin-react@4.7.0+4f50b975d820cbe5/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { defineConfig, loadEnv } from "file:///Users/ademceper/Desktop/merge-com/ui/node_modules/.bun/vite@5.4.21+2d0fe9de801fc453/node_modules/vite/dist/node/index.js";
import { ViteEjsPlugin } from "file:///Users/ademceper/Desktop/merge-com/ui/node_modules/.bun/vite-plugin-ejs@1.7.0+4f50b975d820cbe5/node_modules/vite-plugin-ejs/index.js";
var __vite_injected_original_dirname = "/Users/ademceper/Desktop/merge-com/ui/apps/novu";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
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
        "@novu/shared": path.resolve(__vite_injected_original_dirname, "./src/shared/src/index.ts"),
        "@clerk/clerk-react": path.resolve(__vite_injected_original_dirname, "./src/utils/no-auth/index.tsx"),
        "@/components/side-navigation/organization-dropdown-clerk": path.resolve(
          __vite_injected_original_dirname,
          "./src/utils/no-auth/organization-dropdown.tsx"
        ),
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWRlbWNlcGVyL0Rlc2t0b3AvbWVyZ2UtY29tL3VpL2FwcHMvbm92dVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FkZW1jZXBlci9EZXNrdG9wL21lcmdlLWNvbS91aS9hcHBzL25vdnUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FkZW1jZXBlci9EZXNrdG9wL21lcmdlLWNvbS91aS9hcHBzL25vdnUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSAnQHNlbnRyeS92aXRlLXBsdWdpbic7XG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBWaXRlRWpzUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4tZWpzJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHRhaWx3aW5kY3NzKCksXG4gICAgICBWaXRlRWpzUGx1Z2luKCh2aXRlQ29uZmlnKSA9PiAoe1xuICAgICAgICBlbnY6IHZpdGVDb25maWcuZW52LFxuICAgICAgfSkpLFxuICAgICAgcmVhY3QoKSxcbiAgICAgIC4uLihlbnYuU0VOVFJZX0FVVEhfVE9LRU5cbiAgICAgICAgPyBbXG4gICAgICAgICAgICBzZW50cnlWaXRlUGx1Z2luKHtcbiAgICAgICAgICAgICAgb3JnOiBlbnYuU0VOVFJZX09SRyxcbiAgICAgICAgICAgICAgcHJvamVjdDogZW52LlNFTlRSWV9QUk9KRUNULFxuICAgICAgICAgICAgICBhdXRoVG9rZW46IGVudi5TRU5UUllfQVVUSF9UT0tFTixcbiAgICAgICAgICAgICAgcmVhY3RDb21wb25lbnRBbm5vdGF0aW9uOiB7IGVuYWJsZWQ6IHRydWUgfSxcbiAgICAgICAgICAgICAgc291cmNlbWFwczoge1xuICAgICAgICAgICAgICAgIGFzc2V0czogJy4vZGlzdC8qKicsXG4gICAgICAgICAgICAgICAgZmlsZXNUb0RlbGV0ZUFmdGVyVXBsb2FkOiBbJyoqLyouanMubWFwJ10sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRlbGVtZXRyeTogZmFsc2UsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdXG4gICAgICAgIDogW10pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0Bub3Z1L3NoYXJlZCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9zaGFyZWQvc3JjL2luZGV4LnRzJyksXG4gICAgICAgICdAY2xlcmsvY2xlcmstcmVhY3QnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbm8tYXV0aC9pbmRleC50c3gnKSxcbiAgICAgICAgJ0AvY29tcG9uZW50cy9zaWRlLW5hdmlnYXRpb24vb3JnYW5pemF0aW9uLWRyb3Bkb3duLWNsZXJrJzogcGF0aC5yZXNvbHZlKFxuICAgICAgICAgIF9fZGlybmFtZSxcbiAgICAgICAgICAnLi9zcmMvdXRpbHMvbm8tYXV0aC9vcmdhbml6YXRpb24tZHJvcGRvd24udHN4J1xuICAgICAgICApLFxuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgICAncHJldHRpZXIvc3RhbmRhbG9uZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL25vZGVfbW9kdWxlcy9wcmV0dGllci9zdGFuZGFsb25lLmpzJyksXG4gICAgICAgICdwcmV0dGllci9wbHVnaW5zL2h0bWwnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9ub2RlX21vZHVsZXMvcHJldHRpZXIvcGx1Z2lucy9odG1sLmpzJyksXG4gICAgICAgIHByZXR0aWVyOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9ub2RlX21vZHVsZXMvcHJldHRpZXIvc3RhbmRhbG9uZS5qcycpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogNDIwMSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0RvY3VtZW50LVBvbGljeSc6ICdqcy1wcm9maWxpbmcnLFxuICAgICAgfSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogWydAbm92dS9hcGknXSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEyMDAwLFxuICAgICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICAgIGluY2x1ZGU6IFsvQG5vdnVcXC9hcGkvLCAvbm9kZV9tb2R1bGVzL10sXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1QsU0FBUyx3QkFBd0I7QUFDaFcsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLGNBQWMsZUFBZTtBQUN0QyxTQUFTLHFCQUFxQjtBQUw5QixJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFFM0MsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsWUFBWTtBQUFBLE1BQ1osY0FBYyxDQUFDLGdCQUFnQjtBQUFBLFFBQzdCLEtBQUssV0FBVztBQUFBLE1BQ2xCLEVBQUU7QUFBQSxNQUNGLE1BQU07QUFBQSxNQUNOLEdBQUksSUFBSSxvQkFDSjtBQUFBLFFBQ0UsaUJBQWlCO0FBQUEsVUFDZixLQUFLLElBQUk7QUFBQSxVQUNULFNBQVMsSUFBSTtBQUFBLFVBQ2IsV0FBVyxJQUFJO0FBQUEsVUFDZiwwQkFBMEIsRUFBRSxTQUFTLEtBQUs7QUFBQSxVQUMxQyxZQUFZO0FBQUEsWUFDVixRQUFRO0FBQUEsWUFDUiwwQkFBMEIsQ0FBQyxhQUFhO0FBQUEsVUFDMUM7QUFBQSxVQUNBLFdBQVc7QUFBQSxRQUNiLENBQUM7QUFBQSxNQUNILElBQ0EsQ0FBQztBQUFBLElBQ1A7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLGdCQUFnQixLQUFLLFFBQVEsa0NBQVcsMkJBQTJCO0FBQUEsUUFDbkUsc0JBQXNCLEtBQUssUUFBUSxrQ0FBVywrQkFBK0I7QUFBQSxRQUM3RSw0REFBNEQsS0FBSztBQUFBLFVBQy9EO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxRQUNBLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxRQUNwQyx1QkFBdUIsS0FBSyxRQUFRLGtDQUFXLHVDQUF1QztBQUFBLFFBQ3RGLHlCQUF5QixLQUFLLFFBQVEsa0NBQVcseUNBQXlDO0FBQUEsUUFDMUYsVUFBVSxLQUFLLFFBQVEsa0NBQVcsdUNBQXVDO0FBQUEsTUFDM0U7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixTQUFTO0FBQUEsUUFDUCxtQkFBbUI7QUFBQSxNQUNyQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQyxXQUFXO0FBQUEsSUFDdkI7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxNQUNYLHVCQUF1QjtBQUFBLE1BQ3ZCLGlCQUFpQjtBQUFBLFFBQ2YsU0FBUyxDQUFDLGNBQWMsY0FBYztBQUFBLE1BQ3hDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
