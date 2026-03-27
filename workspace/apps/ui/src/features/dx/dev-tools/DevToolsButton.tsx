import { Button } from "@components/actions/Button.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { memo } from "react";

export interface DevToolsToggleButtonProps {
  height: number;
  onClick: () => void;
}

export const DevToolsToggleButton = memo<DevToolsToggleButtonProps>(function DevToolsToggleButton({ height, onClick }) {
  return (
    <Button
      className="absolute bottom-0 left-0 flex items-center gap-1 rounded-l-none rounded-b-none border-b-0 border-l-0"
      style={{ bottom: height }}
      onClick={onClick}
    >
      <Icon name="Settings" size="sm" />
      DevTools
    </Button>
  );
});
