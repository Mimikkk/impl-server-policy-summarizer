import { IconButton } from "@core/components/actions/IconButton.tsx";
import { memo } from "react";
import { TranslationsViewContext } from "../../../TranslationsView.context.tsx";
import { Table } from "../Table.tsx";

export const TranslationsTable = memo(function TranslationsTable() {
  const { isEditing, handleAddLanguage, tableData } = TranslationsViewContext.use((s) => ({
    isEditing: s.isEditing,
    handleAddLanguage: s.handleAddLanguage,
    tableData: s.tableData.table,
  }));

  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 grid-rows-[1fr_auto]">
      <Table store={tableData} />
      {isEditing
        ? (
          <IconButton
            name="Plus"
            variant="solid"
            className="h-full  max-w-7"
            title="Add language"
            onClick={handleAddLanguage}
          />
        )
        : <div className="w-7" />}
    </div>
  );
});
