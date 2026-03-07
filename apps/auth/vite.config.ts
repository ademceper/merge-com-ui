import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import path from "path"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        TanStackRouterVite({
            routesDirectory: "./src/account/routes",
            generatedRouteTree: "./src/account/routeTree.gen.ts",
            routeTreeFileHeader: ["/* eslint-disable */", "// @ts-nocheck"],
        }),
        TanStackRouterVite({
            routesDirectory: "./src/admin/routes",
            generatedRouteTree: "./src/admin/routeTree.gen.ts",
        }),
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
