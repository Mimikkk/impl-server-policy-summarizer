import { IconButton } from "@core/components/actions/IconButton.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import { TableContext } from "@core/components/tables/components/TableContext.tsx";
import type { TableColumn } from "@core/components/tables/types.ts";
import { memo } from "react";

export const KeyHeadRowCell = memo<{ column: TableColumn<any, any> }>(function KeyColumnCellContent({ column }) {
  const { value, set } = TableContext.use(
    (s) => {
      const { get, set } = s.features.columnFilters.of("key");

      return ({ value: get(), set });
    },
  );

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full items-center h-7">
        <span className="px-3">{column.label}</span>
      </div>
      <div className="flex justify-between w-full items-center h-7">
        <InputField
          compact
          value={value}
          onValueChange={set}
          className="h-full w-full"
        />
        <IconButton name="Search" variant="solid" />
      </div>
    </div>
  );
});
