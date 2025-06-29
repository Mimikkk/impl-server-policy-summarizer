import { type JSX, memo } from "react";

export type ForProps<T, Tag extends keyof JSX.IntrinsicElements> =
  & Omit<JSX.IntrinsicElements[Tag], "children">
  & {
    children: (item: T, index: number, items: T[]) => React.ReactNode;
    each: T[];
    as?: Tag;
    header?: React.ReactNode;
    footer?: React.ReactNode;
  };

export const For = memo(
  function For<T, Tag extends keyof JSX.IntrinsicElements>({
    children,
    each,
    as: As,
    header,
    footer,
    ...props
  }: ForProps<T, Tag>) {
    if (!As) {
      return (
        <>
          {header}
          {each.map(children)}
          {footer}
        </>
      );
    }

    return (
      /* @ts-expect-error - override */
      <As {...props}>
        {header}
        {each.map(children)}
        {footer}
      </As>
    );
  },
) as <T, Tag extends keyof JSX.IntrinsicElements>(
  props: ForProps<T, Tag>,
) => React.ReactNode;
