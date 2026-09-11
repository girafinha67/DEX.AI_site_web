import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Deploy target detection: Netlify and Vercel both stamp their own env var
// on every build (NETLIFY / VERCEL), so we use that to pick Nitro's deploy
// preset at build time. Locally, Nitro falls back to its Node.js default.
const isNetlify = process.env.NETLIFY === "true";
const isVercel = process.env.VERCEL === "1";

const nitroOptions = isNetlify
  ? { preset: "netlify" as const }
  : isVercel
    ? {
        preset: "vercel" as const,
        output: {
          dir: ".vercel/output",
          serverDir: ".vercel/output/functions/__server.func",
          publicDir: ".vercel/output/static",
        },
      }
    : {};

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    nitro(nitroOptions),
  ],
  // Use src/server.ts (our SSR error-handling wrapper) as the server entry
  // instead of TanStack Start's default bundled entry.
  environments: {
    ssr: { build: { rollupOptions: { input: "./src/server.ts" } } },
  },
});
