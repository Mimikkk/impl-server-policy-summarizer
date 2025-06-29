import type { LucideProps } from "lucide-react";
import { type ComponentType, forwardRef, memo, type Ref } from "react";

const SizeSm = "h-4 w-4";
const SizeMd = "h-5 w-5";
const SizeLg = "h-6 w-6";
export type Size = "sm" | "md" | "lg";

const sizes = {
  sm: SizeSm,
  md: SizeMd,
  lg: SizeLg,
};

export interface IconProps extends LucideProps {
  icon: ComponentType<LucideProps>;
  size?: Size;
}

export const Icon = memo(
  forwardRef(function Icon({ icon: Icon, size = "md", ...props }: IconProps, ref: Ref<SVGSVGElement>) {
    return <Icon ref={ref} className={sizes[size]} {...props} />;
  }),
);
