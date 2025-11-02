import { IconButton } from "@core/components/actions/IconButton.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import { memo } from "react";
import { TableContext } from "./TableContext.tsx";

export const TableSearchField = memo(function TableSearchField() {
  const { value, set } = TableContext.use((s) => ({ value: s.features.search.get(), set: s.features.search.set }));

  return (
    <div className="flex">
      <InputField
        compact
        label="Search..."
        value={value}
        onValueChange={set}
        className="w-full"
      />
      <IconButton name="Search" variant="solid" />
    </div>
  );
});
