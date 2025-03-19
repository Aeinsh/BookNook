import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/BookNook/", // 🔥 Replace "BookNook" with your actual repo name
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
