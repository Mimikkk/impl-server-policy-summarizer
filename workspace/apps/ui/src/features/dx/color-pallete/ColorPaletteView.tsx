import { For } from "@components/utility/For.tsx";
import cx from "clsx";
import { memo } from "react";
import { colors } from "./ColorPalette.ts";

const ColorShade = memo(function ColorShade({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cx(
          "w-12 h-12 rounded-sm border border-gray-400",
          color,
        )}
      />
      <span className="text-xs">{color}</span>
    </div>
  );
});

const ColorHeader = memo(function ColorHeader({ color }: { color: string }) {
  return (
    <h3 className="text-lg font-semibold">
      {color}
    </h3>
  );
});

export const ColorPaletteView = memo(function ColorPaletteView() {
  return (
    <For items={Object.entries(colors)}>
      {([color, shades]) => (
        <For
          key={color}
          header={<ColorHeader color={color} />}
          items={shades}
          as="div"
          className="grid grid-cols-12 gap-2"
        >
          {(shade) => <ColorShade key={shade} color={shade} />}
        </For>
      )}
    </For>
  );
});
