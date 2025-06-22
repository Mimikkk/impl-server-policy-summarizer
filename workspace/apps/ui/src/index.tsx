import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryProvider } from "./configs/react-query/ReactQuery.tsx";
import { RouteProvider } from "./configs/react-router/router.tsx";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <QueryProvider>
      <RouteProvider />
    </QueryProvider>
  </StrictMode>,
);
