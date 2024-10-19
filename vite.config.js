import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { chromeExtension } from "vite-plugin-chrome-extension"

export default defineConfig(({ mode }) => ({
    plugins: [react(), chromeExtension()],
    optimizeDeps: {
        include: ["html2canvas-pro"]
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: "src/manifest.json"
        }
    },
    define: {
        __DEV__: mode === "development",
        __EXTENSION_ID__: JSON.stringify("curtain-fall")
    },
    resolve: {
        alias: {
            // eslint-disable-next-line no-undef
            "@": path.resolve(__dirname, "./src")
        }
    },
    server: {
        port: 3000,
        open: "/src/popup/index.html"
    }
}))
