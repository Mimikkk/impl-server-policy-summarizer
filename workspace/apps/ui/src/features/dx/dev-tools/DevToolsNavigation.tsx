import { Icon, type IconName } from "@components/badges/Icon.tsx";
import { For } from "@components/utility/For.tsx";
import { Tabs } from "radix-ui";
import { type ComponentProps, memo, type ReactNode, useCallback } from "react";

const Header = memo(
  function DevToolsTab({ children, icon, ...props }: ComponentProps<typeof Tabs.Trigger> & { icon: IconName }) {
    return (
      <Tabs.Trigger
        {...props}
        className="
        px-4 py-2 
        cursor-pointer transition-colors duration-100
        text-primary-11 data-active:text-primary-12 data-selected:text-primary-12 
        bg-primary-3 hover:bg-primary-4 data-active:bg-primary-5 data-selected:bg-primary-5
        "
      >
        <div className="flex items-center gap-1">
          <Icon name={icon} size="sm" />
          {children as ReactNode}
        </div>
      </Tabs.Trigger>
    );
  },
);

const Panel = memo(function DevToolsPanel({
  children,
  ...props
}: ComponentProps<typeof Tabs.Content>) {
  return (
    <Tabs.Content className="container mx-auto overflow-auto py-4" {...props}>
      {children}
    </Tabs.Content>
  );
});

export interface DevToolsItem {
  value: string;
  label: string;
  icon: IconName;
  component: ReactNode;
}

export interface DevToolsNavigationProps {
  height: number;
  items: DevToolsItem[];
  value: string;
  onValueChange: (key: string) => void;
}

export const DevToolsNavigation = memo(
  function DevToolsNavigation({ height, items, value, onValueChange }: DevToolsNavigationProps) {
    return (
      <Tabs.Root
        className="border-t border-primary-6 bg-primary-2"
        style={{ height }}
        value={value}
        defaultValue={value}
        onValueChange={onValueChange}
      >
        <Tabs.List className="flex border-y bg-primary-1 divide-x divide-primary-6 border-primary-6">
          <For each={items}>
            {useCallback(
              ({ value, label, icon }: DevToolsItem) => <Header key={value} value={value} icon={icon}>{label}</Header>,
              [],
            )}
          </For>
        </Tabs.List>
        <For each={items} as="div" style={{ height: height - 40 }}>
          {useCallback(
            ({ value, component }: DevToolsItem) => <Panel key={value} value={value}>{component}</Panel>,
            [],
          )}
        </For>
      </Tabs.Root>
    );
  },
);
