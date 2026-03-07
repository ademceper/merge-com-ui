import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  outDir: "dist",
  external: ["react", "react-dom"],
  banner: { js: '"use client";' },
});
