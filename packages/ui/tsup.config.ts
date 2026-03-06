import { defineConfig } from "tsup";
import { readdirSync } from "fs";

const components = readdirSync("src/components")
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => `src/components/${f}`);

export default defineConfig({
  entry: [
    "src/lib/utils.ts",
    "src/hooks/use-mobile.ts",
    ...components,
  ],
  format: ["esm"],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  outDir: "dist",
  external: ["react", "react-dom", "next-themes", "tailwindcss"],
  banner: { js: '"use client";' },
});
