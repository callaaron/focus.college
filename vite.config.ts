import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";


// QQ Browser headless mode doesn't execute <script type="module">.
// We use a post-build step to convert to dynamic import() instead.
const plugins: Plugin[] = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  {
    // Auto-replace <script type="module" src="..."> with dynamic import()
    // to keep the build compatible with QQ Browser headless automation.
    name: "qq-browser-shim",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html.replace(
          /<script type="module" crossorigin src="([^"]+)"><\/script>/g,
          (_match, src) =>
            `<script>/* QQ Browser shim: dynamic import() */\nimport('${src}').catch(function(e){document.title='\\u26A0 '+e.message.substring(0,150);});</script>`
        );
      },
    },
  },
];
// vitePluginManusRuntime() disabled — incompatible with QQ Browser automation

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Optimization settings
    rollupOptions: {
      output: {
        // QQ Browser: single bundle (no code splitting) — dynamic import()
        // can't resolve cross-chunk dependencies in headless mode
        inlineDynamicImports: true,
        // Asset file naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false, // Remove comments
      },
    },
    // Source map for production debugging (can disable for smaller builds)
    sourcemap: false,
    // Chunk size warnings
    chunkSizeWarningLimit: 600,
    // CSS code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true,
    // Target modern browsers for smaller bundle
    target: 'es2020',
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      ".sandbox.novita.ai",
      "localhost",
      "127.0.0.1",
    ],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
