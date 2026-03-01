import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import path from "path"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        keycloakify({
            accountThemeImplementation: "Single-Page",
            themeName: "merge"
        })
    ],
    resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
});
