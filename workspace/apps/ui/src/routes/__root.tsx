import { ThemeButton } from "@core/components/actions/ThemeButton.tsx";
import { Icon } from "@core/components/badges/Icon.tsx";
import { Card } from "@core/components/containers/card/Card.tsx";
import { Text } from "@core/components/typography/Text.tsx";
import { DevTools } from "@features/dx/dev-tools/DevTools.tsx";
import { Breadcrumbs } from "@features/ux/layout/Breadcrumbs.tsx";
import { Sidebar } from "@features/ux/layout/Sidebar.tsx";
import { ThemeContext } from "@features/ux/theme/ThemeContext.tsx";
import { Param } from "@hooks/useLocalStorage.ts";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { memo } from "react";

const sidebarOpenParam = Param.boolean({ key: "sidebar-open" });

export const Route = createRootRouteWithContext()({
  component: memo(function RootRoute() {
    const { mode, theme, setMode } = ThemeContext.use();
    const [isSidebarOpen] = sidebarOpenParam.use();

    return (
      <>
        <Sidebar />
        <div
          className="relative flex flex-col py-4 gap-2 h-full transition-all duration-300 md:pl-16"
          style={{ paddingLeft: isSidebarOpen ? "12rem" : undefined }}
        >
          <div className="container mx-auto">
            <Breadcrumbs />
          </div>
          <div className="container mx-auto flex-1">
            <Outlet />
          </div>
          <DevTools />
          <ThemeButton
            className="fixed bottom-4 right-4"
            mode={mode}
            theme={theme}
            onChangeMode={setMode}
          />
        </div>
      </>
    );
  }),
  notFoundComponent: memo(function NotFoundComponent() {
    return (
      <div className="container mx-auto py-4">
        <Card className="w-full flex flex-col items-center" color="info">
          <Text className="flex items-center text-2xl gap-1">
            <Icon name="Cat" size="lg" />
            Oh no! 404
          </Text>
          <Text light>Page not found!</Text>
        </Card>
      </div>
    );
  }),
});
