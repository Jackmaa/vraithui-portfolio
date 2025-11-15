import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    vue(),

    // Bundle analyzer - generates dist/stats.html
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    }),

    // Modern image optimization (replaces deprecated vite-plugin-imagemin)
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: false,
        quality: 80,
      },
    })
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  build: {
    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-vue': ['vue', 'pinia'],

          // Heavy components chunks
          'particles': ['./src/vraithui/effects/ParticlesBackground.vue'],
          'matrix': ['./src/vraithui/components/Matrix.vue'],
        }
      }
    },

    // Size warnings
    chunkSizeWarningLimit: 500,

    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
      },
      format: {
        comments: false, // Remove comments
      }
    },

    // Source maps (disable in production for smaller builds)
    sourcemap: false,

    // CSS code splitting
    cssCodeSplit: true,
  },

  // CSS optimization
  css: {
    devSourcemap: true,
  },

  // Server options for dev
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },

  // Preview server options
  preview: {
    port: 4173,
    strictPort: false,
    open: false,
  },
});
