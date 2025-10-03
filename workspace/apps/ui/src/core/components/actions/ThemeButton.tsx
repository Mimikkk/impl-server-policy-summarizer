import { type ButtonProps } from "@components/actions/Button.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { type ThemeMode, ThemeService } from "@features/ux/theme/ThemeService.tsx";
import { memo, useCallback } from "react";
import { IconButton } from "./IconButton.tsx";

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
        <IconButton
          className="relative"
          onClick={handleClick}
          title={title}
          aria-label={title}
          {...props}
          name={theme === "dark" ? "Moon" : "Sun"}
        >
          {mode === "system" && <Icon name="Settings" size="xs" className="absolute top-0 right-0 stroke-3" />}
        </IconButton>
      </div>
    );
  },
);
