import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import { memo, useCallback, useState } from "react";
import type { TableColumn } from "../../createTable.tsx";
import { useTranslationsView } from "../../TranslationsView.context.tsx";

const map = {
  focused: "secondary",
  source: "success",
  target: "info",
  none: undefined,
} as const;
export const TranslationsTableHeadRowCell = memo<{ column: TableColumn<any, any> }>(
  function TranslationsTableHeadRowCell({ column }) {
    const { isEditing, sourceLanguage, targetLanguage } = useTranslationsView();
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
