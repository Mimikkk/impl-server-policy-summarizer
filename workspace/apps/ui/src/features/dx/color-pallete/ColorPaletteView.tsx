import { For } from "@components/utility/For.tsx";
import { Fragment, memo } from "react";
import { colors } from "../../ux/theme/ColorPalette.ts";

export const ColorPaletteView = memo(function ColorPaletteView() {
  return (
    <For each={colors.names} as="div" className="grid grid-cols-[auto_1fr] items-center gap-2">
      {(name) => {
        return (
          <Fragment key={name}>
            <div className="text-sm font-semibold">{name}</div>
            <For key={name} each={colors.shades} as="div" className="flex border rounded-sm w-fit overflow-hidden">
              {(shade) => <span key={shade} className={`w-8 h-12 bg-${name}-${shade}`} />}
            </For>
          </Fragment>
        );
      }}
    </For>
  );
});
