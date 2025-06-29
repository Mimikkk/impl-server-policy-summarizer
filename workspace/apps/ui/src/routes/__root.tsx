import { ThemeProvider } from "@features/ux/theme/ThemeProvider.tsx";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { DevTools } from "../features/dx/dev-tools/DevTools.tsx";
import { ThemeButton } from "../features/ux/theme/ThemeButton.tsx";

export const Route = createRootRouteWithContext()({
  component: () => (
    <ThemeProvider>
      <div className="min-h-screen relative">
        <Outlet />
        <DevTools />
        <ThemeButton />
      </div>
    </ThemeProvider>
  ),
});
