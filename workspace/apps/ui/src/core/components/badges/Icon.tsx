import clsx from "clsx";
import { icons, type LucideProps } from "lucide-react";
import { createElement, memo } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const SizeXs = "shrink-0 h-3 w-3";
const SizeSm = "shrink-0 h-4 w-4";
const SizeMd = "shrink-0 h-5 w-5";
const SizeLg = "shrink-0 h-6 w-6";

const sizes = {
  xs: SizeXs,
  sm: SizeSm,
  md: SizeMd,
  lg: SizeLg,
};
export type Size = keyof typeof sizes;

export type IconName = keyof typeof icons;

export interface IconProps extends LucideProps {
  name: IconName;
  size?: Size;
}

const cache = new Map<string, string>();
function stringifyIcon(name: IconName, size: Size): string {
  const key = `${name}-${size}`;

  if (!cache.has(key)) {
    const IconComponent = icons[name];
    import("lucide-react");
    const svg = renderToStaticMarkup(
      createElement(IconComponent, { className: sizes[size] }),
    );

    cache.set(key, svg);
  }

  return cache.get(key)!;
}

export const Icon = memo<IconProps>(function Icon({ name, size = "md", ...props }) {
  const svg = stringifyIcon(name, size);

  return <span dangerouslySetInnerHTML={{ __html: svg }} className={clsx(sizes[size], props.className)} />;
});
