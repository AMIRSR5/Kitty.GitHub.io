import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT (GitHub Pages):
// If you deploy to https://<user>.github.io/<repo>/  -> set base to "/<repo>/"
// If you deploy to https://<user>.github.io/ (user/organization page) -> set base to "/"
export default defineConfig({
  base: "/babak-shop/",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
