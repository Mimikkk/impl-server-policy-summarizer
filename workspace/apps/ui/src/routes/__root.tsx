import { ThemeButton } from "@components/actions/ThemeButton.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { Card } from "@components/containers/card/Card.tsx";
import { Text } from "@components/typography/Text.tsx";
import { DevTools } from "@features/dx/dev-tools/DevTools.tsx";
import { Breadcrumbs } from "@features/ux/layout/Breadcrumbs.tsx";
import { Sidebar } from "@features/ux/layout/Sidebar.tsx";
import { useTheme } from "@features/ux/theme/ThemeProvider.tsx";
import { Param } from "@hooks/useLocalStorage.ts";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";

const sidebarOpenParam = Param.boolean({ key: "sidebar-open" });

export const Route = createRootRouteWithContext()({
  component: () => {
    const { mode, theme, setMode: setMode } = useTheme();
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
  },
  notFoundComponent: () => (
    <div className="container mx-auto py-4">
      <Card className="w-full flex flex-col items-center" color="info">
        <Text className="flex items-center text-2xl gap-1">
          <Icon name="Cat" size="lg" />
          Oh no! 404
        </Text>
        <Text light>Page not found</Text>
        <div className="flex gap-2">
          <Link to="/eli">
            <span className="flex items-center gap-1 underline hover:text-primary-11 active:text-primary-12 text-primary-12 hover:no-underline">
              <Icon name="ArrowRight" size="sm" />
              Move to eli
            </span>
          </Link>
        </div>
      </Card>
    </div>
  ),
});
