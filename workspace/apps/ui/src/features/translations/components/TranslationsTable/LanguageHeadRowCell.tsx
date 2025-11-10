import { IconButton } from "@core/components/actions/IconButton.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import type { TableColumn } from "@core/components/tables/types.ts";
import clsx from "clsx";
import { memo, useCallback, useState } from "react";
import { TranslationsViewContext } from "../../TranslationsView.context.tsx";

const map = {
  focused: "secondary",
  source: "success",
  none: undefined,
} as const;
const CellInput = memo<{ column: TableColumn<any, any> }>(
  function RenameLanguageField({ column }) {
    const { isEditing, sourceLanguage } = TranslationsViewContext.use((s) => ({
      isEditing: s.isEditing,
      sourceLanguage: s.sourceLanguage,
    }));
    const [label, setLabel] = useState(column.label);
    const [isFocused, setIsFocused] = useState(false);

    const isSourceLanguage = sourceLanguage === column.id;
    const type = isFocused ? "focused" : isSourceLanguage ? "source" : "none";

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
      isEditing,
      isColumnProcessing,
      handleRemoveLanguage: removeLanguage,
      setSourceLanguage,
      handleColumnFillInMissingTranslations,
      handleColumnCheckGrammarSyntax,
    } = TranslationsViewContext.use(
      (s) => ({
        isSourceLanguage: s.sourceLanguage === column.id,
        isEditing: s.isEditing,
        isColumnProcessing: s.isColumnProcessing(column.id),
        handleRemoveLanguage: s.handleRemoveLanguage,
        setSourceLanguage: s.setSourceLanguage,
        handleColumnCheckGrammarSyntax: s.handleColumnCheckGrammarSyntax,
        handleColumnFillInMissingTranslations: s.handleColumnFillInMissingTranslations,
      }),
    );

    const languageId = column.id;

    const handleFillInMissingTranslations = useCallback(() => {
      return handleColumnFillInMissingTranslations(languageId);
    }, [languageId, handleColumnFillInMissingTranslations]);

    const handleCheckGrammarSyntax = useCallback(() => {
      return handleColumnCheckGrammarSyntax(languageId);
    }, [languageId, handleColumnCheckGrammarSyntax]);

    const handleRemoveLanguage = useCallback(() => {
      removeLanguage(languageId);
    }, [languageId, removeLanguage]);

    const handleSetSourceLanguage = useCallback(() => {
      setSourceLanguage(languageId);
    }, [languageId, setSourceLanguage]);

    return (
      <div
        className={clsx(
          "flex flex-col items-center",
          isSourceLanguage && "bg-success-7",
          !isSourceLanguage && "bg-primary-7",
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
                  onClick={handleRemoveLanguage}
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
            onClick={handleSetSourceLanguage}
          >
            {isEditing ? "source" : "source language"}
          </IconButton>
          {isEditing && (
            <>
              <IconButton
                name={isColumnProcessing ? "Loader" : "WandSparkles"}
                title="Fill in missing translations"
                variant="solid"
                color="info"
                onClick={handleFillInMissingTranslations}
                disabled={isColumnProcessing}
              />
              <IconButton
                name={isColumnProcessing ? "Loader" : "BrainCircuit"}
                title="Check grammar & syntax"
                variant="solid"
                color="info"
                onClick={handleCheckGrammarSyntax}
                disabled={isColumnProcessing}
              />
            </>
          )}
        </div>
      </div>
    );
  },
);
