import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "client"), 
  plugins: [
    react()
    // Removed runtimeErrorOverlay and cartographer (Replit-specific)
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },

  build: {
    outDir: "dist", // just 'dist' — inside client/
    emptyOutDir: true,
  },
  
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
