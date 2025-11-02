import { IconButton } from "@core/components/actions/IconButton.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import type { TableColumn } from "@core/components/tables/types.ts";
import clsx from "clsx";
import { memo, useCallback, useState } from "react";
import { TranslationsViewContext } from "../../TranslationsView.context.tsx";

const map = {
  focused: "secondary",
  source: "success",
  target: "info",
  none: undefined,
} as const;
const CellInput = memo<{ column: TableColumn<any, any> }>(
  function RenameLanguageField({ column }) {
    const { isEditing, sourceLanguage, targetLanguage } = TranslationsViewContext.use((s) => ({
      isEditing: s.isEditing,
      sourceLanguage: s.sourceLanguage,
      targetLanguage: s.targetLanguage,
    }));
    const [label, setLabel] = useState(column.label);
    const [isFocused, setIsFocused] = useState(false);

    const isSourceLanguage = sourceLanguage === column.id;
    const isTargetLanguage = targetLanguage === column.id;
    const type = isFocused ? "focused" : isSourceLanguage ? "source" : isTargetLanguage ? "target" : "none";

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);

    return isEditing
      ? (
        <InputField
          className="w-full h-full"
          value={label}
          onValueChange={setLabel}
          compact
          color={map[type]}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      )
      : <span>{column.label}</span>;
  },
);

export const LanguageHeadRowCell = memo<{ column: TableColumn<any, any> }>(
  function LanguageColumnCell({ column }) {
    const {
      isSourceLanguage,
      isTargetLanguage,
      isEditing,
      handleRemoveLanguage,
      setSourceLanguage,
      setTargetLanguage,
    } = TranslationsViewContext.use(
      (s) => ({
        isSourceLanguage: s.sourceLanguage === column.id,
        isTargetLanguage: s.targetLanguage === column.id,
        isEditing: s.isEditing,
        handleRemoveLanguage: s.handleRemoveLanguage,
        setSourceLanguage: s.setSourceLanguage,
        setTargetLanguage: s.setTargetLanguage,
      }),
    );

    return (
      <div
        className={clsx(
          "flex flex-col items-center",
          isSourceLanguage && "bg-success-7",
          isTargetLanguage && "bg-info-7",
          !isSourceLanguage && !isTargetLanguage && "bg-primary-7",
        )}
      >
        <div className="flex justify-between w-full items-center h-7">
          {isEditing
            ? (
              <>
                <CellInput column={column} />
                <IconButton
                  color="error"
                  name="Trash"
                  variant="solid"
                  onClick={() => handleRemoveLanguage(column.id)}
                />
              </>
            )
            : <span className="px-3 first-letter:capitalize">language - {column.label}</span>}
        </div>
        <div className="flex w-full bg-primary-4">
          <IconButton
            className="flex-1 justify-start"
            name={isSourceLanguage ? "BadgeCheck" : "Badge"}
            color={isSourceLanguage ? "success" : "primary"}
            active={isSourceLanguage}
            onClick={() => {
              if (isTargetLanguage) setTargetLanguage("");
              return setSourceLanguage(column.id);
            }}
          >
            {isEditing ? "source" : "source language"}
          </IconButton>
          <IconButton
            className="flex-1 justify-start"
            name={isTargetLanguage ? "BadgeCheck" : "Badge"}
            color={isTargetLanguage ? "info" : "primary"}
            active={isTargetLanguage}
            onClick={() => {
              if (isSourceLanguage) setSourceLanguage("");
              return setTargetLanguage(column.id);
            }}
          >
            {isEditing ? "target" : "target language"}
          </IconButton>
          {isEditing && (
            <>
              <IconButton name="RotateCcw" variant="solid" color="info" />
              <IconButton name="RotateCcw" variant="solid" color="info" />
              <IconButton name="RotateCcw" variant="solid" color="info" />
            </>
          )}
        </div>
      </div>
    );
  },
);
