import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: "./src/index.tsx",
    },
  },
  html: {
    template: "./src/index.html",
  },
  output: {
    target: "web",
  },
  resolve: {
    alias: {
      "@components": "./src/core/components",
      "@utilities": "./src/core/utilities",
      "@services": "./src/core/services",
      "@hooks": "./src/core/hooks",
      "@features": "./src/features",
      "@configs": "./src/configs",
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
