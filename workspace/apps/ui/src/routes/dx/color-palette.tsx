import { ColorPaletteView } from "@features/dx/color-pallete/ColorPaletteView.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dx/color-palette")({
  component: ColorPaletteView,
});
