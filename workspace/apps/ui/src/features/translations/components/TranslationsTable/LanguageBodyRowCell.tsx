import { ButtonGroup } from "@core/components/actions/ButtonGroup.tsx";
import { IconButton } from "@core/components/actions/IconButton.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import type { TableColumn, TableRow } from "@core/components/tables/types.ts";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { buttonColorMap, inputColorMap } from "../../constants.ts";
import { TranslationsViewContext } from "../../TranslationsView.context.tsx";

export const LanguageBodyRowCell = memo<{ row: TableRow<any>; column: TableColumn<any, any> }>(
  function LanguageBodyRowCell({ row, column }) {
    const {
      isEditing,
      sourceLanguage,
      focusedCell,
      setFocusedCell,
      handleCellTranslate,
      handleCellRegenerate,
      handleCellVerify,
      isCellProcessing,
      hasPendingReview,
    } = TranslationsViewContext.use((s) => ({
      isEditing: s.isEditing,
      sourceLanguage: s.sourceLanguage,
      focusedCell: s.focusedCell,
      setFocusedCell: s.setFocusedCell,
      handleCellTranslate: s.handleCellTranslate,
      handleCellRegenerate: s.handleCellRegenerate,
      handleCellVerify: s.handleCellVerify,
      isCellProcessing: s.isCellProcessing(row.id, column.id),
      hasPendingReview: s.hasPendingReview,
    }));

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
    const [value, setValue] = useState(row.values[column.id]);

    useEffect(() => {
      setValue(row.values[column.id]);
    }, [row.values[column.id]]);

    const isFocusedCell = focusedCell?.rowId === row.id && focusedCell?.columnId === column.id;
    const type = isFocusedCell ? "focused" : isSourceLanguage ? "source" : "none";

    const handleTranslate = useCallback(() => {
      handleCellTranslate(row.id, column.id);
    }, [row.id, column.id, handleCellTranslate]);

    const handleRegenerate = useCallback(() => {
      handleCellRegenerate(row.id, column.id);
    }, [row.id, column.id, handleCellRegenerate]);

    const handleVerify = useCallback(() => {
      handleCellVerify(row.id, column.id);
    }, [row.id, column.id, handleCellVerify]);

    const isProcessing = isCellProcessing;
    const isPendingReview = hasPendingReview(row.id, column.id);

    const opacity = type !== "focused" ? "opacity-80" : undefined;
    const buttonColor = buttonColorMap[type];
    const inputColor = inputColorMap[type];
    return (
      <div
        ref={ref}
        data-source={isSourceLanguage ? "" : undefined}
        className="flex justify-between h-full w-full"
      >
        {isEditing
          ? (
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
              <ButtonGroup>
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
                      onClick={handleTranslate}
                      className={opacity}
                    />
                    <IconButton
                      title="Verify translation"
                      name="BrainCircuit"
                      variant="solid"
                      color={buttonColor}
                      onClick={handleVerify}
                      className={opacity}
                    />
                    <IconButton
                      title="Regenerate translation"
                      name="RotateCcw"
                      variant="solid"
                      color={buttonColor}
                      onClick={handleRegenerate}
                      className={opacity}
                    />
                  </>
                )}
              </ButtonGroup>
            </div>
          )
          : <span className="truncate text-ellipsis self-center px-[13px]">{value}</span>}
      </div>
    );
  },
);
