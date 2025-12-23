import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";
import compress from "astro-compress";
import prefetch from "@astrojs/prefetch";

export default defineConfig({
  output: "server",

  adapter: node({
    mode: "standalone",
    isr: {
      expiration: 60 * 60,
    },
  }),

  integrations: [
    tailwind(),
    react(),
    compress({
      html: true,
      css: true,
      js: true,
      svg: true,
      img: true,
    }),
    prefetch(),
  ],

  vite: {
    build: {
      cssMinify: true,
      minify: "terser",
      rollupOptions: {
        treeshake: true,
      },
    },
  },

  server: {
    port: 5500,
    host: true,
  },

  build: {
    sourcemap: false,
  },
});
