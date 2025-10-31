import { Button } from "@components/actions/Button.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { Text } from "@components/typography/Text.tsx";
import { useRouterState } from "@tanstack/react-router";
import { memo, useMemo } from "react";

export const Breadcrumbs = memo(function Breadcrumbs() {
  const state = useRouterState();
  const parts = useMemo(() => state.location.pathname.split("/").filter(Boolean), [state.location.pathname]);

  return (
    <div className="flex items-center gap-1">
      <Text light>Location:</Text>
      <span className="flex items-center gap-1">
        <Button variant="text" className="flex px-1 gap-1">
          <Icon name="HdmiPort" /> Home
        </Button>
        {parts.length ? <span>/</span> : null}
        {parts.map((part, index, parts) => (
          <Button variant="text" className="px-1" key={part}>{part}{index < parts.length - 1 && <span>/</span>}</Button>
        ))}
      </span>
    </div>
  );
});
