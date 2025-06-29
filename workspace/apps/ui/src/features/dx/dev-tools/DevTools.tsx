import { Button } from "@components/actions/Button.tsx";
import { Show } from "@components/utility/Show.tsx";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import cx from "clsx";
import { type ComponentProps, forwardRef, memo, type Ref, useCallback, useState } from "react";
import { ColorPaletteView } from "../color-pallete/ColorPaletteView.tsx";
import { useHeightResize } from "../dev-tools/useHeightResize.tsx";

const DevToolsTab = memo(function DevToolsTab({
  children,
  ...props
}: React.ComponentProps<typeof Tab>) {
  return (
    <Tab
      {...props}
      className={({ selected }: { selected: boolean }) =>
        cx(
          "px-4 py-2 text-sm font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-accent-4 focus:ring-offset-2",
          selected
            ? "bg-accent-2 text-accent-dark border-b-2 border-accent-5"
            : "text-accent-7 hover:text-accent-dark hover:bg-accent-2",
        )}
    >
      {children}
    </Tab>
  );
});

const DevToolsPanel = memo(function DevToolsPanel({
  children,
  ...props
}: ComponentProps<typeof TabPanel>) {
  return (
    <TabPanel className="h-full overflow-auto py-2 px-4" {...props}>
      {children}
    </TabPanel>
  );
});

const DevToolsResizer = memo(
  forwardRef(function DevToolsResizer(_, ref: Ref<HTMLDivElement>) {
    return (
      <div
        ref={ref}
        className="absolute top-0 left-0 right-0 h-1 -mt-1 bg-accent-3 cursor-ns-resize hover:bg-accent-4 active:bg-accent-5"
      />
    );
  }),
);

const DevToolsNavigation = memo(function DevToolsNavigation({
  height,
}: {
  height: number;
}) {
  return (
    <TabGroup
      className="bg-accent-2 border-t border-accent-3 shadow-lg flex flex-col"
      style={{ height }}
    >
      <TabList className="flex border-b border-accent-3 bg-accent-1 flex-shrink-0">
        <DevToolsTab>Colors</DevToolsTab>
        <DevToolsTab>Components</DevToolsTab>
        <DevToolsTab>Network</DevToolsTab>
      </TabList>
      <TabPanels className="flex-1 min-h-0">
        <DevToolsPanel>
          <ColorPaletteView />
        </DevToolsPanel>
        <DevToolsPanel>
          <div className="text-center text-accent-7 py-8">
            <h3 className="text-lg font-medium mb-2">Components</h3>
            <p>Component inspector coming soon...</p>
          </div>
        </DevToolsPanel>
        <DevToolsPanel>
          <div className="text-center text-accent-7 py-8">
            <h3 className="text-lg font-medium mb-2">Network</h3>
            <p>Network requests monitor coming soon...</p>
          </div>
        </DevToolsPanel>
      </TabPanels>
    </TabGroup>
  );
});

export const DevTools = memo(function DevTools() {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { height } = useHeightResize({ ref });

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <Show when={isOpen}>
        <DevToolsNavigation height={height} />
        <DevToolsResizer ref={setRef} />
      </Show>
      <DevToolsToggleButton isOpen={isOpen} height={height} onClick={toggle} />
    </div>
  );
});

interface DevToolsToggleButtonProps {
  isOpen: boolean;
  height: number;
  onClick: () => void;
}

const DevToolsToggleButton = memo<DevToolsToggleButtonProps>(
  function DevToolsToggleButton({ isOpen, height, onClick }) {
    return (
      <Button
        className="rounded-b-none rounded-l-none"
        style={{ bottom: isOpen ? height : 0 }}
        onClick={onClick}
      >
        DevTools
      </Button>
    );
  },
);
