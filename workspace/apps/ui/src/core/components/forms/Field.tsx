import { Show } from "@components/utility/Show.tsx";
import { type HTMLAttributes, memo } from "react";

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export const Field = memo(function Field({ id, label, children }: FieldProps) {
  return (
    <div className="relative flex flex-col gap-2">
      <Show when={label}>
        <label
          htmlFor={id}
          className="absolute -top-1.5 left-2 text-xs px-1 rounded-xs bg-primary-2 text-primary-11"
        >
          {label}
        </label>
      </Show>
      {children}
    </div>
  );
});
