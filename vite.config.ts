import path from "path";

import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   https: {
  //     key: path.resolve(__dirname, "certs", "./localhost-key.pem"),
  //     cert: path.resolve(__dirname, "certs", "./localhost.pem"),
  //   },
  // },
});
