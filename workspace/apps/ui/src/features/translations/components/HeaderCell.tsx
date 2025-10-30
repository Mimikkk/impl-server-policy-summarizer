import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import { memo, useState } from "react";
import type { TableColumn } from "../createTable.tsx";
import { useTranslationsView } from "../TranslationsView.context.tsx";

export const HeaderCell = memo<{ column: TableColumn<any, any> }>(function HeaderCell({ column }) {
  const { isEditing, sourceLanguage, targetLanguage } = useTranslationsView();
  const [label, setLabel] = useState(column.label);
  const [isFocused, setIsFocused] = useState(false);

  const isSourceLanguage = sourceLanguage === column.id;
  const isTargetLanguage = targetLanguage === column.id;

  return isEditing
    ? (
      <InputField
        className="w-full h-full"
        value={label}
        onValueChange={setLabel}
        compact
        color={isFocused ? "secondary" : isSourceLanguage ? "success" : isTargetLanguage ? "info" : undefined}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    )
    : <span>{column.label}</span>;
});

