import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";


const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];

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
        // Manual chunking for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Router
            if (id.includes('wouter')) {
              return 'vendor-router';
            }
            // Query
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // tRPC
            if (id.includes('@trpc')) {
              return 'vendor-trpc';
            }
            // Recharts (large chart library)
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // UI libraries
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'ui-components';
            }
            // All other node_modules
            return 'vendor';
          }
        },
        // Asset file naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Minification settings - AGGRESSIVE
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3, // Multiple compression passes for smaller size
        unsafe: true, // Enable unsafe optimizations
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
        toplevel: true, // Mangle top-level names
      },
      mangle: {
        toplevel: true, // Mangle top-level names for smaller size
        safari10: true, // Work around Safari 10 bug
      },
      format: {
        comments: false, // Remove all comments
        ecma: 2020, // Target ES2020
      },
    },
    // Source map disabled for smaller builds
    sourcemap: false,
    // Chunk size warnings
    chunkSizeWarningLimit: 600,
    // CSS code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true,
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Module preload polyfill disabled for faster loading
    modulePreload: {
      polyfill: false, // Assume modern browsers
    },
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
