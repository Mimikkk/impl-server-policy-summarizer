import { ThemeContext } from "@features/ux/theme/ThemeContext.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryProvider } from "./configs/react-query/ReactQuery.tsx";
import { RouteProvider } from "./configs/react-router/Router.tsx";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <ThemeContext.Provider storage="app-theme">
      <QueryProvider>
        <RouteProvider />
      </QueryProvider>
    </ThemeContext.Provider>
  </StrictMode>,
);
