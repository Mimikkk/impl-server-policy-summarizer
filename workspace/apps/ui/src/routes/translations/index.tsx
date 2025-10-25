import { TranslationsView } from "@features/translations/TranslationsView.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/translations/")({
  component: TranslationsView,
});
