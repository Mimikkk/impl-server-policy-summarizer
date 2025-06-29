import { Button } from "@components/actions/Button.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { Moon, Settings, Sun } from "lucide-react";
import { useEffect } from "react";
import { useTheme } from "./ThemeProvider.tsx";

export const ThemeButton = () => {
  const { mode, theme, setNextMode } = useTheme();

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="absolute bottom-0 right-0">
      <Button variant="text" className="relative w-8 h-8 rounded-r-none rounded-b-none" onClick={setNextMode}>
        {theme === "dark" && <Icon icon={Moon} />}
        {theme === "light" && <Icon icon={Sun} />}
        {mode === "system" && <Icon icon={Settings} className="absolute top-0 right-0 w-3 h-3 stroke-3" />}
      </Button>
    </div>
  );
};
