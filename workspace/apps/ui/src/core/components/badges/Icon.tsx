import cx from "clsx";
import { icons, type LucideProps } from "lucide-react";
import { memo } from "react";

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

export const Icon = memo<IconProps>(function Icon({ name, size = "md", ...props }) {
  const IconComponent = icons[name];

  return <IconComponent {...props} className={cx(sizes[size], props.className)} />;
});
