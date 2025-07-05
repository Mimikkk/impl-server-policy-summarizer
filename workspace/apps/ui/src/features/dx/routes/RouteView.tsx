import { Button } from "@components/actions/Button.tsx";
import { Text } from "@components/typography/Text.tsx";
import { Route, useRouter } from "@tanstack/react-router";
import { memo, useCallback, useMemo } from "react";
import { Card } from "../../../core/components/containers/card/Card.tsx";

interface RouteNode {
  id: string;
  path: string;
  fullPath: string;
  children?: RouteNode[];
}

const RouteTreeItem = memo<{
  route: RouteNode;
  level: number;
  onNavigate: (path: string) => void;
  currentPath: string;
}>(({ route, level, onNavigate, currentPath }) => {
  const isActive = currentPath === route.fullPath;
  const hasChildren = route.children && route.children.length > 0;

  return (
    <div className="space-y-1">
      <div
        className={`
          flex items-center gap-2 p-2 rounded-md transition-colors
          ${isActive ? "bg-primary/20 text-primary border border-primary/30" : "hover:bg-muted/50"}
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Text
              className={`font-mono text-sm ${isActive ? "font-semibold" : ""}`}
            >
              {route.path}
            </Text>
            {route.id !== route.path && (
              <Text className="text-muted-foreground">
                ({route.id})
              </Text>
            )}
          </div>
          {route.fullPath !== route.path && (
            <Text className="text-muted-foreground">
              Full: {route.fullPath}
            </Text>
          )}
        </div>
        <Button
          variant="text"
          onClick={() => onNavigate(route.fullPath)}
          disabled={isActive}
          className="text-xs px-2 py-1"
        >
          {isActive ? "Current" : "Navigate"}
        </Button>
      </div>
      {hasChildren && (
        <div className="space-y-1">
          {route.children!.map((child) => (
            <RouteTreeItem
              key={child.id}
              route={child}
              level={level + 1}
              onNavigate={onNavigate}
              currentPath={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const buildRouteTree = (route: Route): RouteNode => {
  const node: RouteNode = {
    id: route.id || route.path || "/",
    path: route.path || "/",
    fullPath: route.fullPath || route.path || "/",
  };

  if (route.children && Object.keys(route.children).length > 0) {
    node.children = Object.values(route.children).map(buildRouteTree);
  }

  return node;
};

const useRouteStats = (routeTreeData: RouteNode) => {
  const router = useRouter();

  const routeStats = useMemo(() => {
    const countRoutes = (node: RouteNode): number => {
      let count = 1;
      if (node.children) {
        count += node.children.reduce((sum, child) => sum + countRoutes(child), 0);
      }

      return count;
    };

    const totalRoutes = countRoutes(routeTreeData);
    const activeRoute = router.state.location.pathname;
    const routeDepth = activeRoute.split("/").filter(Boolean).length;

    return { totalRoutes, activeRoute, routeDepth };
  }, [router.state.location.pathname]);

  return routeStats;
};

export const RouteView = memo(function RouteView() {
  const router = useRouter();

  const handleNavigate = useCallback((path: string) => router.navigate({ to: path }), [router]);

  const paths = useMemo(() => buildRouteTree(router.routeTree), []);
  const stats = useRouteStats(paths);

  console.log(paths);

  return (
    <div className="flex flex-col gap-2">
      <Card label="Route stats">
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Text>Total Routes:</Text>
          <Text>{stats.totalRoutes}</Text>
          <Text>Current Route:</Text>
          <Text>{stats.activeRoute}</Text>
          <Text>Route Depth:</Text>
          <Text>{stats.routeDepth}</Text>
        </div>
      </Card>
      <Card label="Navigation">
        <div className="max-h-96 overflow-auto">
          <RouteTreeItem
            route={paths}
            level={0}
            onNavigate={handleNavigate}
            currentPath={router.state.location.pathname}
          />
        </div>
      </Card>
    </div>
  );
});
