import { EliView } from "@features/eli/EliView.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/eli/")({
  component: EliView,
});
