import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/BookNook/", // 🔥 Change "BookNook" to your GitHub repo name
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html", // Ensures correct entry point
    },
  },
});
