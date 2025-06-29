import { Button, ButtonProps } from "@components/actions/Button.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { Moon, Settings, Sun } from "lucide-react";
import { memo } from "react";

export interface ThemeButtonProps extends ButtonProps {
  className?: string;
  theme: "dark" | "light";
  mode: "system" | "dark" | "light";
}

export const ThemeButton = memo(function ThemeButton({ className, theme, mode, ...props }: ThemeButtonProps) {
  return (
    <div className={className}>
      <Button variant="text" className="relative w-8 h-8" {...props}>
        {theme === "dark" && <Icon icon={Moon} />}
        {theme === "light" && <Icon icon={Sun} />}
        {mode === "system" && <Icon icon={Settings} className="absolute top-0 right-0 w-3 h-3 stroke-3" />}
      </Button>
    </div>
  );
});
