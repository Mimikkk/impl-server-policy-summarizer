import { Button, ButtonProps } from "@components/actions/Button.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { ThemeMode, ThemeService } from "@features/ux/theme/ThemeService.tsx";
import { Moon, Settings, Sun } from "lucide-react";
import { memo, useCallback } from "react";

export interface ThemeButtonProps extends ButtonProps {
  className?: string;
  theme: "dark" | "light";
  mode: "system" | "dark" | "light";
  onChangeMode: (mode: ThemeMode) => void;
}
const getTitle = (mode: ThemeMode) => {
  if (mode === "light") return "Toggle to dark theme";
  if (mode === "dark") return "Toggle to light theme";
  return "Toggle to system theme";
};

export const ThemeButton = memo(
  function ThemeButton({ className, theme, mode, onChangeMode, ...props }: ThemeButtonProps) {
    const title = getTitle(mode);

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      onChangeMode(ThemeService.next(mode));
    }, [onChangeMode, mode]);

    return (
      <div className={className}>
        <Button
          variant="text"
          className="relative w-8 h-8"
          onClick={handleClick}
          title={title}
          aria-label={title}
          {...props}
        >
          {theme === "dark" && <Icon icon={Moon} />}
          {theme === "light" && <Icon icon={Sun} />}
          {mode === "system" && <Icon icon={Settings} className="absolute top-0 right-0 w-3 h-3 stroke-3" />}
        </Button>
      </div>
    );
  },
);
