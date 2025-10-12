import { RoutesView } from "@features/dx/routes/RoutesView.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dx/routes")({
  component: RoutesView,
});
