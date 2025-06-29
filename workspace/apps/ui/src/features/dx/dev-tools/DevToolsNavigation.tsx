import { For } from "@components/utility/For.tsx";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import cx from "clsx";
import { type ComponentProps, memo, useCallback, useMemo } from "react";
import { ColorPaletteView } from "../color-pallete/ColorPaletteView.tsx";

const DevToolsTab = memo(function DevToolsTab({
  children,
  ...props
}: React.ComponentProps<typeof Tab>) {
  return (
    <Tab
      {...props}
      className={({ selected }: { selected: boolean }) =>
        cx(
          "px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-primary-4 focus:ring-offset-2",
          selected ? "bg-primary-2 text-primary-dark border-b-2 border-primary-5" : "hover:bg-primary-2",
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

export interface DevToolsNavigationProps {
  height: number;
  items: {
    key: string;
    label: string;
    component: React.ReactNode;
  }[];
  tab: string;
  onChange: (key: string) => void;
}

export const DevToolsNavigation = memo(
  function DevToolsNavigation({ height, items, tab, onChange }: DevToolsNavigationProps) {
    const handleChange = useCallback((index: number) => {
      onChange(items[index].key);
    }, [items, onChange]);

    const index = useMemo(() => items.findIndex((item) => item.key === tab), [items, tab]);

    return (
      <TabGroup
        className="bg-primary-5 border-t border-accent-5 shadow-lg flex flex-col"
        style={{ height }}
        tabIndex={index}
        defaultIndex={index}
        onChange={handleChange}
      >
        <TabList className="flex border-b border-accent-5 bg-primary-1 flex-shrink-0">
          <For each={items}>
            {(item) => <DevToolsTab key={item.key}>{item.label}</DevToolsTab>}
          </For>
        </TabList>
        <TabPanels className="flex-1 min-h-0">
          <DevToolsPanel>
            <ColorPaletteView />
          </DevToolsPanel>
          <DevToolsPanel>
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Components</h3>
              <p>Component inspector coming soon...</p>
            </div>
          </DevToolsPanel>
          <DevToolsPanel>
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Network</h3>
              <p>Network requests monitor coming soon...</p>
            </div>
          </DevToolsPanel>
        </TabPanels>
      </TabGroup>
    );
  },
);
