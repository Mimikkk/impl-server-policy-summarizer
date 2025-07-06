import { ThemeButton } from "@components/actions/ThemeButton.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { Card } from "@components/containers/card/Card.tsx";
import { Text } from "@components/typography/Text.tsx";
import { DevTools } from "@features/dx/dev-tools/DevTools.tsx";
import { useTheme } from "@features/ux/theme/ThemeProvider.tsx";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { CatIcon } from "lucide-react";
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
  notFoundComponent: () => (
    <div className="container mx-auto py-8">
      <Card className="w-full flex flex-col items-center" color="info">
        <Text className="flex items-center text-2xl gap-1">
          <Icon icon={CatIcon} size="lg" />
          404
        </Text>
        <Text light>Page not found</Text>
      </Card>
    </div>
  ),
});
