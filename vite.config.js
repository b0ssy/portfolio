import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";

/** @type {import('vite').UserConfig} */
export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        "/v1/login": `${process.env.VITE_PROXY_BACKEND ?? ""}`,
      },
    },
  });
};
