import { DevTools } from "../features/dx/dev-tools/DevTools.tsx";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

export const Route = createRootRouteWithContext()({
  component: () => (
    <div className="min-h-screen relative">
      <Outlet />
      <DevTools />
    </div>
  ),
});
