import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/images-to-pdf-math/",
  test: {
    environment: "jsdom",
  },
});
