import { createRouter, ErrorComponent, RouterProvider } from "@tanstack/react-router";
import { memo } from "react";
import { routeTree } from "./RouteTree.gen.ts";

const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div className={`p-2 text-2xl`}>
      Loading...
    </div>
  ),
  defaultErrorComponent: ErrorComponent,
  defaultPreload: "intent",
  scrollRestoration: true,
});

export const RouteProvider = memo(() => <RouterProvider router={router} />);

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
