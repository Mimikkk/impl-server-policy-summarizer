import { Card } from "@components/containers/card/Card.tsx";
import { For } from "@components/utility/For.tsx";
import { memo, useCallback } from "react";
import { type ColorName, colors } from "../../ux/theme/ColorPalette.ts";

export const ColorPaletteView = memo(function ColorPaletteView() {
  const { names, shades } = colors;

  return (
    <For each={names} as="div" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {useCallback(
        (name: ColorName) => (
          <Card compact label={name} key={name} color={name} className="flex flex-col gap-2">
            <For each={shades} as="div" className="flex rounded-sm overflow-hidden">
              {(shade) => <span key={shade} className={`w-full h-12 bg-${name}-${shade}`} />}
            </For>
          </Card>
        ),
        [],
      )}
    </For>
  );
});
