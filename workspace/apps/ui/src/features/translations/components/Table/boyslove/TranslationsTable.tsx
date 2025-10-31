import { IconButton } from "@core/components/actions/IconButton.tsx";
import { memo } from "react";
import { TranslationsViewContext } from "../../../TranslationsView.context.tsx";
import { TranslationsStats } from "../../TranslationsStats.tsx";
import { Table } from "../Table.tsx";

export const TranslationsTable = memo(function TranslationsTable() {
  const { isEditing, handleAddLanguage, handleAddKey, toggleEdit, handleCancel, handleSave, tableData } =
    TranslationsViewContext.use((s) => ({
      isEditing: s.isEditing,
      handleAddLanguage: s.handleAddLanguage,
      handleAddKey: s.handleAddKey,
      toggleEdit: s.toggleEdit,
      handleCancel: s.handleCancel,
      handleSave: s.handleSave,
      tableData: s.tableData.table,
    }));

  return (
    <div className="flex flex-col gap-2">
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

      <div className="col-span-full flex items-center gap-2 w-full justify-end">
        {isEditing && (
          <IconButton
            name="Plus"
            variant="solid"
            className="w-full max-h-7"
            title="Add key"
            square={false}
            onClick={handleAddKey}
          />
        )}
        {!isEditing && (
          <IconButton name="FilePen" variant="solid" className="" onClick={toggleEdit}>
            Toggle edit
          </IconButton>
        )}
        {isEditing && <IconButton color="error" title="Cancel" name="X" variant="solid" onClick={handleCancel} />}
        {isEditing && <IconButton color="success" name="Check" title="Save" variant="solid" onClick={handleSave} />}
      </div>
      <TranslationsStats />
    </div>
  );
});
