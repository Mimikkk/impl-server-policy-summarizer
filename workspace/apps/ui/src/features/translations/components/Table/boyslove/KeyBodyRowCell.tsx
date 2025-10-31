import { IconButton } from "@core/components/actions/IconButton.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { inputColorMap } from "../../../constants.ts";
import type { TableColumn, TableRow } from "../../../defineTable.tsx";
import { TranslationsViewContext } from "../../../TranslationsView.context.tsx";

export const KeyBodyRowCell = memo<{ row: TableRow<any>; column: TableColumn<any, any> }>(
  function KeyBodyRowCell({ row, column }) {
    const {
      isEditing,
      sourceLanguage,
      targetLanguage,
      focusedCell,
      setFocusedCell,
      isCellProcessing,
    } = TranslationsViewContext.use();

    const ref = useRef<HTMLTableCellElement>(null);
    useEffect(() => {
      if (focusedCell?.columnId === column.id && focusedCell?.rowId === row.id) {
        const input = ref.current?.querySelector("input");

        if (input) {
          input.focus();
        }
      }
    }, [focusedCell?.columnId, focusedCell?.rowId, ref]);

    const isSourceLanguage = sourceLanguage === column.id;
    const isTargetLanguage = targetLanguage === column.id;
    const [value, setValue] = useState(row.original[column.id]);

    useEffect(() => {
      setValue(row.original[column.id]);
    }, [row.original[column.id]]);

    const isFocusedCell = focusedCell?.rowId === row.id && focusedCell?.columnId === column.id;
    const type = isFocusedCell ? "focused" : isSourceLanguage ? "source" : isTargetLanguage ? "target" : "none";

    const handleRowRemove = useCallback(() => {
      console.log("remove row", row.id);
    }, [row.id]);

    const isProcessing = isCellProcessing(row.id, column.id);

    const inputColor = inputColorMap[type];
    return (
      <div
        ref={ref}
        data-source={isSourceLanguage ? "" : undefined}
        data-target={isTargetLanguage ? "" : undefined}
        className="flex justify-between h-full w-full"
      >
        {isEditing
          ? (
            <>
              <IconButton
                name="Trash"
                variant="solid"
                color="error"
                onClick={handleRowRemove}
              />
              <div className="flex w-full min-w-0">
                <InputField
                  onFocus={() => setFocusedCell({ rowId: row.id, columnId: column.id })}
                  onBlur={() => setFocusedCell(null)}
                  className="w-full"
                  color={inputColor}
                  value={value}
                  onValueChange={setValue}
                  disabled={isProcessing}
                />
              </div>
            </>
          )
          : <span className="truncate text-ellipsis self-center pl-[41px] pr-[13px]">{value}</span>}
      </div>
    );
  },
);
