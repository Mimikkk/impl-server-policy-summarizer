import { Icon, type IconType } from "@components/badges/Icon.tsx";
import { For } from "@components/utility/For.tsx";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { type ComponentProps, memo, type ReactNode, useCallback, useMemo } from "react";

const Header = memo(
  function DevToolsTab({ children, icon, ...props }: ComponentProps<typeof Tab> & { icon: IconType }) {
    return (
      <Tab
        {...props}
        className="
        px-4 py-2 
        cursor-pointer transition-colors 
        text-primary-11 data-active:text-primary-12 data-selected:text-primary-12 
        bg-primary-3 hover:bg-primary-4 data-active:bg-primary-5 data-selected:bg-primary-5
        "
      >
        <div className="flex items-center gap-1">
          <Icon icon={icon} size="sm" />
          {children as ReactNode}
        </div>
      </Tab>
    );
  },
);

const Panel = memo(function DevToolsPanel({
  children,
  ...props
}: ComponentProps<typeof TabPanel>) {
  return (
    <TabPanel className="container mx-auto overflow-auto py-4" {...props}>
      {children}
    </TabPanel>
  );
});

export interface DevToolsItem {
  key: string;
  label: string;
  icon: IconType;
  component: ReactNode;
}

export interface DevToolsNavigationProps {
  height: number;
  items: DevToolsItem[];
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
        className="border-t border-primary-6 bg-primary-2"
        style={{ height }}
        tabIndex={index}
        defaultIndex={index}
        onChange={handleChange}
      >
        <TabList className="flex border-y bg-primary-1 divide-x-1 divide-primary-6 border-primary-6">
          <For each={items}>
            {(item) => <Header key={item.key} icon={item.icon}>{item.label}</Header>}
          </For>
        </TabList>
        <TabPanels className="overflow-auto" style={{ maxHeight: height - 40 }}>
          <For each={items}>
            {(item) => <Panel key={item.key}>{item.component}</Panel>}
          </For>
        </TabPanels>
      </TabGroup>
    );
  },
);
