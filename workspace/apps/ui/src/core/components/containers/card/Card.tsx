import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import cx from "clsx";
import {
  type HTMLAttributes,
  memo,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { IconButton } from "../../actions/IconButton.tsx";
import { Text } from "../../typography/Text.tsx";

export interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  color?: ColorName;
  className?: string;
  label?: ReactNode;
  compact?: boolean;
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
    slots,
    maxizable,
    ...props
  },
) {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMaximize = useCallback(() => {
    setIsMaximized((x) => !x);
  }, []);

  const onEscapePress = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    setIsMaximized(false);
  });

  useEffect(() => {
    if (!isMaximized) return;

    document.body.style.overflow = "hidden";
    globalThis.addEventListener("keydown", onEscapePress);
    return () => {
      document.body.style.overflow = "";
      globalThis.removeEventListener("keydown", onEscapePress);
    };
  }, [isMaximized]);

  const maximize = maxizable && (
    <IconButton key="maximize" name={isMaximized ? "Minimize" : "Maximize"} onClick={handleMaximize} />
  );

  const content = (
    <div
      role={isMaximized ? "dialog" : undefined}
      aria-modal={isMaximized ? "true" : undefined}
      {...props}
      className={cx(
        `
            relative
            bg-${color}-1
            border rounded-sm border-${color}-6 
            hover:border-${color}-10
            active:border-${color}-10
            shadow-sm
            transition-colors
        `,
        label && "mt-2",
        isMaximized ? "w-full" : undefined,
        compact ? undefined : (label ? "p-4 pb-2" : "px-4 py-2"),
        className,
      )}
    >
      {label && (
        <Text
          light
          className={`
            absolute -top-2 left-2
            max-w-[calc(100%-1rem)]
            px-1
            bg-${color}-2 
            rounded-xs
            text-xs truncate
          `}
        >
          {label}
        </Text>
      )}
      {children}
      {slots?.icons?.length || maximize && (
            <div
              className={cx(
                "absolute flex gap-0.5",
                slots?.iconsPosition === "bottom-right" ? "bottom-2 right-2" : "top-2 right-2",
              )}
            >
              {slots?.icons?.map((icon, index) => <div key={index}>{icon}</div>)}
              {maximize}
            </div>
          )}
    </div>
  );

  if (isMaximized) {
    return (
      <div className="rounded-sm fixed z-50 top-0 left-0 w-full h-full px-10 py-6 mx-auto backdrop-blur-sm *:h-full flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
});
