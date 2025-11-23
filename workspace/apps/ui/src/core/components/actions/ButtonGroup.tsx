import { defineContext } from "@utilities/defineContext.ts";
import clsx from "clsx";
import { type HTMLAttributes, memo } from "react";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {}

export const ButtonGroupContext = defineContext(() => true);
export const ButtonGroup = memo<ButtonGroupProps>(function ButtonGroup(props) {
  return (
    <ButtonGroupContext.Provider>
      <div {...props} className={clsx(props.className, "flex rounded-sm")} />
    </ButtonGroupContext.Provider>
  );
});
