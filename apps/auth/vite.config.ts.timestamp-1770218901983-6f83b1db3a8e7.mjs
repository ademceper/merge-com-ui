// vite.config.ts
import { defineConfig } from "file:///Users/ademceper/Desktop/ui/node_modules/.bun/vite@5.4.21+008a1778b4e2f308/node_modules/vite/dist/node/index.js";
import react from "file:///Users/ademceper/Desktop/ui/node_modules/.bun/@vitejs+plugin-react@4.7.0+ca02c6e1833a7ffa/node_modules/@vitejs/plugin-react/dist/index.js";
import { keycloakify } from "file:///Users/ademceper/Desktop/ui/node_modules/.bun/keycloakify@11.14.2/node_modules/keycloakify/vite-plugin/index.js";
import path from "path";
import tailwindcss from "file:///Users/ademceper/Desktop/ui/node_modules/.bun/@tailwindcss+vite@4.1.18+ca02c6e1833a7ffa/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/ademceper/Desktop/ui/apps/auth";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    keycloakify({
      accountThemeImplementation: "Multi-Page",
      themeName: "merge"
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWRlbWNlcGVyL0Rlc2t0b3AvdWkvYXBwcy9hdXRoXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYWRlbWNlcGVyL0Rlc2t0b3AvdWkvYXBwcy9hdXRoL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9hZGVtY2VwZXIvRGVza3RvcC91aS9hcHBzL2F1dGgvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHsga2V5Y2xvYWtpZnkgfSBmcm9tIFwia2V5Y2xvYWtpZnkvdml0ZS1wbHVnaW5cIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIlxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IFtcbiAgICAgICAgcmVhY3QoKSxcbiAgICAgICAgdGFpbHdpbmRjc3MoKSxcbiAgICAgICAga2V5Y2xvYWtpZnkoe1xuICAgICAgICAgICAgYWNjb3VudFRoZW1lSW1wbGVtZW50YXRpb246IFwiTXVsdGktUGFnZVwiLFxuICAgICAgICAgICAgdGhlbWVOYW1lOiBcIm1lcmdlXCJcbiAgICAgICAgfSlcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVMsU0FBUyxvQkFBb0I7QUFDOVQsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsbUJBQW1CO0FBQzVCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGlCQUFpQjtBQUp4QixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixZQUFZO0FBQUEsTUFDUiw0QkFBNEI7QUFBQSxNQUM1QixXQUFXO0FBQUEsSUFDZixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNOLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
