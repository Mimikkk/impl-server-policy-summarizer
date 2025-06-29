import { Show } from "@components/utility/Show.tsx";
import { createLocalStorageOptions, useLocalStorage } from "@hooks/useLocalStorage.ts";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ColorPaletteView } from "../color-pallete/ColorPaletteView.tsx";
import { useHeightResize } from "../dev-tools/useHeightResize.tsx";
import { DevToolsToggleButton } from "./DevToolsButton.tsx";
import { DevToolsNavigation } from "./DevToolsNavigation.tsx";
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
  deserialize: (value) => value === null ? "colors" : value,
});

const useTabIndex = () => useLocalStorage(DevToolsTabIndexOptions);

export const DevTools = memo(function DevTools() {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [isOpen, toggle] = useIsOpen();
  const height = useHeight(ref);
  const [selectedTab, setSelectedTab] = useTabIndex();

  const items = useMemo(() => [{
    key: "colors",
    label: "Colors",
    component: <ColorPaletteView />,
  }, {
    key: "components",
    label: "Components",
    component: <div>Components</div>,
  }], []);

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
