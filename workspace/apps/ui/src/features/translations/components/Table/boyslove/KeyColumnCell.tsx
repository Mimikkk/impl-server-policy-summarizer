import { IconButton } from "@core/components/actions/IconButton.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import { memo } from "react";
import type { TableColumn } from "../../../defineTable.tsx";
import { TranslationsViewContext } from "../../../TranslationsView.context.tsx";

export const KeyColumnCell = memo<{ column: TableColumn<any, any> }>(function KeyColumnCellContent({ column }) {
  const { keyQuery, setKeyQuery } = TranslationsViewContext.use(
    (s) => ({ keyQuery: s.keyQuery, setKeyQuery: s.setKeyQuery }),
  );

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full items-center h-7">
        <span className="px-3">{column.label}</span>
      </div>
      <div className="flex justify-between w-full items-center h-7">
        <InputField
          compact
          value={keyQuery}
          onValueChange={setKeyQuery}
          className="h-full w-full"
        />
        <IconButton name="Search" variant="solid" />
      </div>
    </div>
  );
});
