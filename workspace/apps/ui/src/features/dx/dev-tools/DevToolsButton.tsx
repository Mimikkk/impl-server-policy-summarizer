import { Button } from "@components/actions/Button.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { Settings } from "lucide-react";
import { memo } from "react";

export interface DevToolsToggleButtonProps {
  height: number;
  onClick: () => void;
}

export const DevToolsToggleButton = memo<DevToolsToggleButtonProps>(
  function DevToolsToggleButton({ height, onClick }) {
    return (
      <Button
        className="rounded-b-none rounded-l-none absolute bottom-0 left-0 flex items-center gap-1"
        style={{ bottom: height }}
        onClick={onClick}
      >
        <Icon className="w-4 h-4" icon={Settings} />
        DevTools
      </Button>
    );
  },
);
