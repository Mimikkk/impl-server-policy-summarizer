import cx from "clsx";
import { icons, type LucideProps } from "lucide-react";
import { forwardRef, memo, type Ref } from "react";

const SizeSm = "h-4 w-4";
const SizeMd = "h-5 w-5";
const SizeLg = "h-6 w-6";
export type Size = "sm" | "md" | "lg";

const sizes = {
  sm: SizeSm,
  md: SizeMd,
  lg: SizeLg,
};

export type IconName = keyof typeof icons;

export interface IconProps extends LucideProps {
  name: IconName;
  size?: Size;
}

export const Icon = memo(
  forwardRef(function Icon({ name, size = "md", ...props }: IconProps, ref: Ref<SVGSVGElement>) {
    const IconComponent = icons[name];

    return <IconComponent ref={ref} {...props} className={cx(sizes[size], props.className)} />;
  }),
);
