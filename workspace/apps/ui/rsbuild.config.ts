import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";

const env = loadEnv();

const define = Object.fromEntries(
  Object.entries(env.parsed).map(([key, value]) => [
    `import.meta.env.${key}`,
    JSON.stringify(value),
  ]),
);

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: "./src/index.tsx",
    },
    define,
  },
  html: {
    template: "./src/index.html",
    scriptLoading: "module",
  },
  output: {
    target: "web",
    filename: {
      js: "[name]-[contenthash].mjs",
    },
  },
  server: {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["ETag"],
      credentials: false,
      maxAge: 600,
    },
  },
  resolve: {
    alias: {
      "@components": "./src/core/components",
      "@utilities": "./src/core/utilities",
      "@services": "./src/core/services",
      "@hooks": "./src/core/hooks",
      "@features": "./src/features",
      "@configs": "./src/configs",
      "@clients": "./src/clients",
    },
  },
  tools: {
    rspack: {
      plugins: [tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
        generatedRouteTree: "./src/configs/react-router/RouteTree.gen.ts",
      })],
    },
    swc: {
      jsc: {
        parser: {
          syntax: "typescript",
          tsx: true,
        },
        transform: {
          react: {
            runtime: "automatic",
          },
        },
      },
    },
  },
});
