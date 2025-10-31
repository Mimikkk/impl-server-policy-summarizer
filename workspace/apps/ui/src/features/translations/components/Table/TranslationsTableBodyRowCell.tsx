import { IconButton } from "@core/components/actions/IconButton.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { buttonColorMap, inputColorMap } from "../../constants.ts";
import type { TableColumn, TableRow } from "../../createTable.tsx";
import { useTranslationsView } from "../../TranslationsView.context.tsx";

export const TranslationsTableBodyRowCell = memo<{ row: TableRow<any>; column: TableColumn<any, any> }>(
  function TranslationsTableBodyRowCell({ row, column }) {
    const {
      isEditing,
      sourceLanguage,
      targetLanguage,
      focusedCell,
      setFocusedCell,
      handleCellTranslate,
      handleCellRegenerate,
      handleCellVerify,
      isCellProcessing,
      hasPendingReview,
    } = useTranslationsView();
    const isKey = column.id === "key";

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

    const onCellTranslate = useCallback(() => {
      handleCellTranslate(row.id, column.id);
    }, [row.id, column.id, handleCellTranslate]);

    const onCellRegenerate = useCallback(() => {
      handleCellRegenerate(row.id, column.id);
    }, [row.id, column.id, handleCellRegenerate]);

    const onCellVerify = useCallback(() => {
      handleCellVerify(row.id, column.id);
    }, [row.id, column.id, handleCellVerify]);

    const isProcessing = isCellProcessing(row.id, column.id);
    const isPendingReview = hasPendingReview(row.id, column.id);

    const opacity = type !== "focused" ? "opacity-80" : undefined;
    const buttonColor = buttonColorMap[type];
    const inputColor = inputColorMap[type];
    return (
      <td
        ref={ref}
        data-source={isSourceLanguage ? "" : undefined}
        data-target={isTargetLanguage ? "" : undefined}
        className={clsx(
          "flex-1",
          !isEditing && "flex items-center px-[13px] overflow-auto",
        )}
      >
        <div className="flex justify-between h-full">
          {isEditing && isKey && (
            <>
              <IconButton
                name="Trash"
                variant="solid"
                color="error"
                onClick={handleRowRemove}
              />
            </>
          )}
          {isEditing
            ? (
              <div className="flex w-full">
                <InputField
                  onFocus={() => setFocusedCell({ rowId: row.id, columnId: column.id })}
                  onBlur={() => setFocusedCell(null)}
                  className="w-full"
                  color={inputColor}
                  value={value}
                  onValueChange={setValue}
                  disabled={isProcessing}
                />
                {!isKey && (
                  <>
                    {isProcessing && (
                      <IconButton
                        title="Processing..."
                        name="Loader"
                        variant="solid"
                        color="warning"
                        iconClassName="animate-spin"
                      />
                    )}
                    {isPendingReview && !isProcessing && (
                      <IconButton
                        title="Pending review"
                        name="MessageSquare"
                        variant="solid"
                        color="warning"
                        iconClassName="animate-pulse"
                      />
                    )}
                    {!isProcessing && (
                      <>
                        <IconButton
                          title="Translate"
                          name="WandSparkles"
                          variant="solid"
                          color={buttonColor}
                          onClick={onCellTranslate}
                          className={opacity}
                        />
                        <IconButton
                          title="Verify translation"
                          name="BrainCircuit"
                          variant="solid"
                          color={buttonColor}
                          onClick={onCellVerify}
                          className={opacity}
                        />
                        <IconButton
                          title="Regenerate translation"
                          name="RotateCcw"
                          variant="solid"
                          color={buttonColor}
                          onClick={onCellRegenerate}
                          className={opacity}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            )
            : <span className="flex items-center h-full truncate text-ellipsis">{value}</span>}
        </div>
      </td>
    );
  },
);
