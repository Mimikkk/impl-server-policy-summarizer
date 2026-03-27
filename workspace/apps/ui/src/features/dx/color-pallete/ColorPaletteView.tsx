import { Card } from "@components/containers/card/Card.tsx";
import { For } from "@components/utility/For.tsx";
import { memo, useCallback } from "react";
import { type ColorName, colors } from "../../ux/theme/ColorPalette.ts";

export const ColorPaletteView = memo(function ColorPaletteView() {
  const { names, shades } = colors;

  return (
    <For each={names} as="div" className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {useCallback(
        (name: ColorName) => (
          <Card compact label={name} key={name} color={name} className="flex flex-col gap-2">
            <For each={shades} as="div" className="flex overflow-hidden rounded-sm">
              {(shade) => <span key={shade} className={`h-12 w-full bg-${name}-${shade}`} />}
            </For>
          </Card>
        ),
        [],
      )}
    </For>
  );
});
