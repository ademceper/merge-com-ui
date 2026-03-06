import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/oidc.ts",
    "src/provider.tsx",
    "src/token.ts",
    "src/types.ts",
    "src/hooks/use-auth.ts",
    "src/hooks/use-user.ts",
    "src/hooks/use-organization.ts",
    "src/hooks/use-organization-list.ts",
    "src/hooks/helpers.ts",
    "src/components/user-profile.tsx",
  ],
  format: ["esm"],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  outDir: "dist",
  external: [
    "react",
    "react-dom",
    "next-themes",
    "@merge-rd/ui",
    "@phosphor-icons/react",
  ],
  banner: { js: '"use client";' },
});
