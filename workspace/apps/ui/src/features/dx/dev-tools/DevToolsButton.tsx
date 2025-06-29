import { Button } from "@components/actions/Button.tsx";
import { memo } from "react";

export interface DevToolsToggleButtonProps {
  height: number;
  onClick: () => void;
}

export const DevToolsToggleButton = memo<DevToolsToggleButtonProps>(
  function DevToolsToggleButton({ height, onClick }) {
    return (
      <Button
        className="rounded-b-none rounded-l-none absolute bottom-0 left-0"
        style={{ bottom: height }}
        onClick={onClick}
      >
        DevTools
      </Button>
    );
  },
);
