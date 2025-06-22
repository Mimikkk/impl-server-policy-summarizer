import { type JSX, memo } from "react";

export type ForProps<T, Tag extends keyof JSX.IntrinsicElements> =
  & Omit<JSX.IntrinsicElements[Tag], "children">
  & {
    children: (item: T, index: number, items: T[]) => React.ReactNode;
    items: T[];
    as?: Tag;
    header?: React.ReactNode;
    footer?: React.ReactNode;
  };

export const For = memo(
  function For<T, Tag extends keyof JSX.IntrinsicElements>({
    children,
    items,
    as: As,
    header,
    footer,
    ...props
  }: ForProps<T, Tag>) {
    if (!As) {
      return (
        <>
          {header}
          {items.map(children)}
          {footer}
        </>
      );
    }

    return (
      /* @ts-expect-error - override */
      <As {...props}>
        {header}
        {items.map(children)}
        {footer}
      </As>
    );
  },
) as <T, Tag extends keyof JSX.IntrinsicElements>(
  props: ForProps<T, Tag>,
) => React.ReactNode;
