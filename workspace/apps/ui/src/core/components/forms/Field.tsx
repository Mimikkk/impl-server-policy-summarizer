import { Show } from "@components/utility/Show.tsx";
import { Fieldset, Legend } from "@headlessui/react";
import { type HTMLAttributes, memo } from "react";

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export const Field = memo(function Field({ id, label, children }: FieldProps) {
  return (
    <Fieldset className="
      relative flex flex-col gap-2 
      bg-primary-3 hover:bg-primary-4 active:bg-primary-5
      border border-primary-6 focus-within:border-primary-7 active:border-primary-7 hover:border-primary-8
      rounded-xs transition-colors duration-100
    ">
      <Show when={label}>
        <Legend htmlFor={id} className="absolute -top-1.5 left-2 text-xs px-1 rounded-xs bg-primary-2 text-primary-11">
          {label}
        </Legend>
      </Show>
      {children}
    </Fieldset>
  );
});
