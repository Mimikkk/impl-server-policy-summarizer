import cx from "clsx";
import { memo, type PropsWithChildren } from "react";

interface TextProps extends PropsWithChildren {
  theme: "dark" | "light";
}
export const DisplayText = memo(function DisplayText({ theme, children }: TextProps) {
  return <div className={cx(theme === "dark" ? "text-info-dark" : "text-info-light")}>{children}</div>;
});
