import { Button } from "@components/actions/Button.tsx";
import { Text } from "@components/typography/Text.tsx";
import { For } from "@components/utility/For.tsx";
import { Route, useRouter } from "@tanstack/react-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "../../../core/components/containers/card/Card.tsx";

interface RouteNode {
  id: string;
  path: string;
  fullPath: string;
  children?: RouteNode[];
}

export interface RouteTreeItemProps {
  route: RouteNode;
  path: string;
  depth?: number;
  onPathChange: (path: string) => void;
}

const Tree = memo<RouteTreeItemProps>(({ route, path, depth = 1, onPathChange }) => {
  const isActive = path === route.fullPath;

  const handleClick = useCallback(() => {
    onPathChange(route.fullPath);
  }, [onPathChange, route.fullPath]);

  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Text color="info">
            {depth}
          </Text>
          <span>-</span>
          <Text light={!isActive}>
            {route.path}
          </Text>
        </span>
        <Button variant="text" onClick={handleClick} disabled={isActive} className="text-xs px-2 w-16">
          {isActive ? "Current" : "Navigate"}
        </Button>
      </div>
      <For each={route.children}>
        {useCallback(
          (child: RouteNode) => (
            <Tree key={child.id} route={child} path={path} depth={depth + 1} onPathChange={onPathChange} />
          ),
          [],
        )}
      </For>
    </Card>
  );
});

const extractRoutes = (route: Route): RouteNode => ({
  id: route.id,
  path: route.path,
  fullPath: route.fullPath,
  children: route.children ? Object.values(route.children).map(extractRoutes) : undefined,
});

const useRoutes = () => {
  const router = useRouter();

  return useMemo(() => extractRoutes(router.routeTree), [router.routeTree]);
};

const useRouteStats = (data: RouteNode) => {
  const router = useRouter();

  const stats = useMemo(() => {
    const countRoutes = (node: RouteNode): number => {
      let count = 1;
      if (node.children) {
        count += node.children.reduce((sum, child) => sum + countRoutes(child), 0);
      }

      return count;
    };

    const totalRoutes = countRoutes(data);
    const activeRoute = router.state.location.pathname;
    const routeDepth = activeRoute.split("/").filter(Boolean).length;

    return { total: totalRoutes, active: activeRoute, maxDepth: routeDepth };
  }, [router.state.location.pathname, data]);

  return stats;
};

const useCurrentRouterPath = () => {
  const router = useRouter();
  const [current, setCurrent] = useState(router.state.location.pathname);

  useEffect(() =>
    router.subscribe("onBeforeNavigate", (state) => {
      setCurrent(state.toLocation.pathname);
    }), []);

  return current;
};

export const RoutesView = memo(function RouteView() {
  const router = useRouter();

  const handleNavigate = useCallback((path: string) => router.navigate({ to: path }), [router]);
  const current = useCurrentRouterPath();
  const paths = useRoutes();
  const stats = useRouteStats(paths);

  return (
    <div className="flex flex-col gap-2">
      <Card label="Route stats">
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Text>Current Route:</Text>
          <Text light>{stats.active}</Text>
          <Text>Total Routes:</Text>
          <Text light>{stats.total}</Text>
          <Text>Route Depth:</Text>
          <Text light>{stats.maxDepth}</Text>
        </div>
      </Card>
      <Card label="Navigation">
        <div className="max-h-96 overflow-auto">
          <Tree route={paths} path={current} onPathChange={handleNavigate} />
        </div>
      </Card>
    </div>
  );
});
