import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import cx from "clsx";
import {
  type HTMLAttributes,
  memo,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { IconButton } from "../../actions/IconButton.tsx";
import { Text } from "../../typography/Text.tsx";
import { Show } from "../../utility/Show.tsx";

export interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  color?: ColorName;
  className?: string;
  label?: string;
  compact?: boolean;
  active?: boolean;
  slots?: {
    icons?: ReactNode[];
    iconsPosition?: "top-right" | "bottom-right";
  };
  maxizable?: boolean;
}

export const Card = memo<CardProps>(function Card(
  {
    children,
    className,
    label,
    compact,
    color = "primary",
    active = false,
    slots,
    maxizable,
    ...props
  },
) {
  const [isMaximized, setIsMaximized] = useState(false);
  const handleMaximize = useCallback(() => {
    setIsMaximized((x) => !x);
  }, [setIsMaximized]);

  const maximize = useMemo(
    () =>
      maxizable
        ? <IconButton key="maximize" name={isMaximized ? "Minimize" : "Maximize"} onClick={handleMaximize} />
        : undefined,
    [maxizable, isMaximized, handleMaximize],
  );

  return (
    <div
      className={isMaximized
        ? "rounded-sm fixed z-50 top-0 left-0 w-full h-full px-10 py-6 mx-auto backdrop-blur-sm [&>*]:h-full flex items-center justify-center"
        : "contents"}
    >
      <div
        data-active={active ? "" : undefined}
        {...props}
        className={cx(
          `
            relative
            bg-${color}-1
            border rounded-sm
            border-${color}-6 
            hover:border-${color}-10
            active:border-${color}-10
            shadow-sm
            transition-colors
        `,
          label && "mt-2",
          !compact && "p-4",
          className,
        )}
      >
        <Show when={label}>
          <Text
            light
            className={`absolute -top-2 left-2 bg-${color}-2 border-${color}-6 text-xs px-1 rounded-xs max-w-[calc(100%-1rem)] overflow-hidden text-ellipsis whitespace-nowrap`}
          >
            {label}
          </Text>
        </Show>
        {children}
        <Show when={slots?.icons?.length || maximize}>
          <div
            className={cx(
              "absolute flex gap-0.5",
              slots?.iconsPosition === "bottom-right" ? "bottom-2 right-2" : "top-2 right-2",
            )}
          >
            {slots?.icons?.map((icon, index) => <div key={index}>{icon}</div>)}
            {maximize}
          </div>
        </Show>
      </div>
    </div>
  );
});
