import { memo } from "react";
import { Icon, type IconName } from "../badges/Icon.tsx";
import { Button, type ButtonProps } from "./Button.tsx";

export interface IconButtonProps extends ButtonProps {
  name: IconName;
}

export const IconButton = memo<IconButtonProps>(function IconButton(
  { variant = "text", name, compact, square = true, children, ...props },
) {
  return (
    <Button variant={variant} compact={compact} square={square} {...props}>
      <Icon name={name} size={compact ? "sm" : "md"} />
      {children}
    </Button>
  );
});
