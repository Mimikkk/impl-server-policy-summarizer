import { ThemeButton } from "@components/actions/ThemeButton.tsx";
import { DevTools } from "@features/dx/dev-tools/DevTools.tsx";
import { useTheme } from "@features/ux/theme/ThemeProvider.tsx";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createRootRouteWithContext()({
  component: () => {
    const { mode, theme, setMode: setMode } = useTheme();

    useEffect(() => {
      document.body.setAttribute("data-theme", theme);
    }, [theme]);

    return (
      <div className="min-h-screen relative">
        <Outlet />
        <DevTools />
        <ThemeButton
          className="absolute bottom-0 right-0"
          mode={mode}
          theme={theme}
          onChangeMode={setMode}
        />
      </div>
    );
  },
});
