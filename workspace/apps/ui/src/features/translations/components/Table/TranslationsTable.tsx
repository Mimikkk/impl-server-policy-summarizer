import { IconButton } from "@core/components/actions/IconButton.tsx";
import { memo } from "react";
import { TranslationsViewContext } from "../../TranslationsView.context.tsx";
import { TranslationsTableBody } from "./TranslationsTableBody.tsx";
import { TranslationsTableHead } from "./TranslationsTableHead.tsx";

export const TranslationsTable = memo(function TranslationsTable() {
  const { isEditing, handleAddLanguage, scrollContainerRef } = TranslationsViewContext.use();

  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 grid-rows-[1fr_auto]">
      <div
        ref={scrollContainerRef}
        className="overflow-auto block h-[500px] relative border border-primary-6 rounded-sm"
      >
        <table className="border-separate w-full" cellSpacing="0" cellPadding="0">
          <TranslationsTableHead />
          <TranslationsTableBody />
        </table>
      </div>
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
