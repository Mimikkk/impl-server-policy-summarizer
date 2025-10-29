import { memo } from "react";
import { Icon, type IconName } from "../badges/Icon.tsx";
import { Button, type ButtonProps } from "./Button.tsx";

export interface IconButtonProps extends ButtonProps {
  name: IconName;
  iconClassName?: string;
}

export const IconButton = memo<IconButtonProps>(function IconButton(
  { variant = "text", name, compact, children, square = !children, active, iconClassName, ...props },
) {
  return (
    <Button variant={variant} compact={compact} square={square} active={active} {...props}>
      <Icon name={name} size={compact ? "sm" : "md"} className={iconClassName} />
      {children}
    </Button>
  );
});
