import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// ESM __dirname fix
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // The root of your Vite project should be this client folder
  root: __dirname,

  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID
      ? [
          (await import("@replit/vite-plugin-cartographer")).cartographer(),
          (await import("@replit/vite-plugin-dev-banner")).devBanner(),
        ]
      : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),               // typical app alias
      "@assets": path.resolve(__dirname, "src/assets"),  // assets
    },
  },

  build: {
    // Output build into a folder that your server can serve
    outDir: path.resolve(__dirname, "../dist/public"),
    emptyOutDir: true,
  },

  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
