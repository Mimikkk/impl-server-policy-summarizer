import { RouteView } from "@features/dx/routes/RouteView.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dx/routes")({
  component: RouteView,
});
