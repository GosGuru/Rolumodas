import path from "node:path";
import react from "@vitejs/plugin-react";
import { createLogger, defineConfig } from "vite";

const isDev = process.env.NODE_ENV !== "production";
// let inlineEditPlugin, editModeDevPlugin;

// if (isDev) {
//   inlineEditPlugin = (
//     await import("./plugins/visual-editor/vite-plugin-react-inline-editor.js")
//   ).default;
//   editModeDevPlugin = (
//     await import("./plugins/visual-editor/vite-plugin-edit-mode.js")
//   ).default;
// }

console.warn = () => {};

const logger = createLogger();
const loggerError = logger.error;

logger.error = (msg, options) => {
  if (options?.error?.toString().includes("CssSyntaxError: [postcss]")) {
    return;
  }

  loggerError(msg, options);
};

export default defineConfig({
  customLogger: logger,
  plugins: [
    // ...(isDev ? [inlineEditPlugin(), editModeDevPlugin()] : []),
    react(),
    // ... otros plugins si los hay
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ... otras configuraciones si las hay
});
