import { Show } from "@components/utility/Show.tsx";
import { useEventListener } from "@hooks/useEventListener.ts";
import { createLocalStorageOptions, useLocalStorage } from "@hooks/useLocalStorage.ts";
import { ComponentIcon, IceCreamConeIcon, PaletteIcon, RouteIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ColorPaletteView } from "../color-pallete/ColorPaletteView.tsx";
import { ComponentsView } from "../components/ComponentsView.tsx";
import { useHeightResize } from "../dev-tools/useHeightResize.tsx";
import { IconPalleteView } from "../icon-pallete/IconPalleteView.tsx";
import { RouteView } from "../routes/RouteView.tsx";
import { DevToolsToggleButton } from "./DevToolsButton.tsx";
import { DevToolsItem, DevToolsNavigation } from "./DevToolsNavigation.tsx";
import { DevToolsResizer } from "./DevToolsResizer.tsx";

export const DevToolsHeightOptions = createLocalStorageOptions<number>({
  key: "dev-tools-height",
  serialize: (value) => value.toString(),
  deserialize: (value) => value === null ? 300 : Number(value),
});

const useHeight = (ref: HTMLDivElement | null) => {
  const [value, setValue] = useLocalStorage(DevToolsHeightOptions);

  const { height } = useHeightResize({ ref, initial: value });
  useEffect(() => {
    setValue(height);
  }, [height, setValue]);

  return value;
};

const DevToolsOpenOptions = createLocalStorageOptions<boolean>({
  key: "dev-tools-open",
  serialize: (value) => value.toString(),
  deserialize: (value) => value === "true",
});

const useIsOpen = () => {
  const [value, setValue] = useLocalStorage(DevToolsOpenOptions);

  const toggle = useCallback(() => setValue((v) => !v), []);

  return [value, toggle] as const;
};

const DevToolsTabIndexOptions = createLocalStorageOptions<string>({
  key: "dev-tools-tab-index",
  serialize: (value) => value.toString(),
  deserialize: (value) => value === null ? "routes" : value,
});

const useTabIndex = () => useLocalStorage(DevToolsTabIndexOptions);

const useItems = () => {
  return useMemo((): DevToolsItem[] => [{
    key: "routes",
    label: "Routes",
    icon: RouteIcon,
    component: <RouteView />,
  }, {
    key: "colors",
    label: "Colors",
    icon: PaletteIcon,
    component: <ColorPaletteView />,
  }, {
    key: "components",
    label: "Components",
    icon: ComponentIcon,
    component: <ComponentsView />,
  }, {
    key: "icons",
    label: "Icons",
    icon: IceCreamConeIcon,
    component: <IconPalleteView />,
  }], []);
};

export const DevTools = memo(function DevTools() {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [isOpen, toggle] = useIsOpen();
  const height = useHeight(ref);
  const [selectedTab, setSelectedTab] = useTabIndex();

  const items = useItems();

  useEventListener("keydown", (event) => {
    if (!event.altKey || !event.ctrlKey || event.key !== "d") return;

    event.preventDefault();
    toggle();
  });

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <Show when={isOpen}>
        <DevToolsNavigation height={height} items={items} tab={selectedTab} onChange={setSelectedTab} />
        <DevToolsResizer ref={setRef} />
      </Show>
      <DevToolsToggleButton height={isOpen ? height : 0} onClick={toggle} />
    </div>
  );
});
