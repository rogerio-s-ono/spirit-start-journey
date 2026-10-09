import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: "/spirit-start-journey/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-popover", "@radix-ui/react-select", "@radix-ui/react-tabs"],
          "vendor-animation": ["framer-motion"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          "vendor-charts": ["recharts"],
          "vendor-utils": ["date-fns", "clsx", "tailwind-merge"],
          // Feature chunks
          "pages-welcome": ["./src/pages/Welcome.tsx"],
          "pages-dashboard": ["./src/pages/Dashboard.tsx"],
          "pages-learning": ["./src/pages/LearningPath.tsx", "./src/pages/LessonPage.tsx"],
          "pages-journal": ["./src/pages/Journal.tsx"],
          "pages-profile": ["./src/pages/Profile.tsx"],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to avoid warnings for now
  },
}));
