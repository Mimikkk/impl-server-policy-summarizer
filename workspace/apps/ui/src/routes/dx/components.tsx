import { ComponentsView } from "@features/dx/components/ComponentsView.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dx/components")({
  component: ComponentsView,
});
