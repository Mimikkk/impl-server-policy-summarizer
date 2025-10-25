import { ServerClient } from "@clients/server/ServerClient.ts";
import { Param } from "@hooks/useLocalStorage.ts";
import { createContext } from "@utilities/createContext.tsx";
import { requestFilePicker } from "@utilities/requestFilePicker.ts";
import { useCallback, useState } from "react";

type Updater<T> = (value: T) => Partial<T> | undefined;
interface Storage {
  version: number;
  filename: string;
  contents: Record<string, string>[];
}

const ShowMissingTranslationsParam = Param.boolean({ key: "show-missing-translations" });
const StorageParam = Param.new<Storage>({
  key: "translations-storage",
  serialize: (value) => JSON.stringify(value),
  deserialize: (value) => value ? JSON.parse(value) : undefined,
});

export const [useTranslationsView, TranslationsViewProvider] = createContext(() => {
  const [showMissingTranslations, setShowMissingTranslations] = ShowMissingTranslationsParam.use();
  const toggleShowMissingTranslations = useCallback(() => setShowMissingTranslations((x) => !x), []);

  const [focusedCell, setFocusedCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = useCallback(() => setIsEditing((x) => !x), []);

  const [storage, setStorage] = StorageParam.use();

  const handleLoadCsv = useCallback(async () => {
    const file = await requestFilePicker({ types: ["text/csv"] });
    if (!file) return;

    const contents = await ServerClient.csv(file);
    setStorage({ version: Date.now(), filename: file.name, contents });
  }, []);

  const [query, setQuery] = useState("");

  const updateStorage = useCallback((updater: Updater<Storage>) => {
    setStorage((s) => {
      const result = updater(s);
      if (result === undefined) return s;

      return ({ ...s, version: Date.now(), ...result });
    });
  }, []);

  const handleAddKey = useCallback(() => {
    updateStorage((s) => ({ contents: [...s?.contents ?? [], { key: "", value: "" }] }));
  }, []);

  const handleRemoveKey = useCallback((rowId: string) => {
    updateStorage((s) => {
      const content = s?.contents?.find((_, index) => index === +rowId);

      if (Object.values(content ?? {}).some((x) => !!x)) {
        const result = confirm("Are you sure you want to remove the key? There are non-empty values in the key.");
        if (!result) return;
      }

      return ({ contents: s?.contents?.filter((_, index) => index !== +rowId) ?? [] });
    });
  }, []);

  const handleAddLanguage = useCallback(() => {
    updateStorage((s) => ({
      contents: s.contents?.map((item) => ({ ...item, ["..."]: "" })) ?? [],
    }));
  }, []);

  const handleRemoveLanguage = useCallback((columnId: string) => {
    console.log(columnId);
    updateStorage((s) => {
      if (s?.contents?.some((item) => !!item[columnId])) {
        const result = confirm(
          "Are you sure you want to remove the language? There are non-empty values in the language.",
        );
        if (!result) return;
      }

      const contents = structuredClone(s?.contents ?? []);
      for (const item of contents) {
        if (item[columnId] === undefined) continue;
        delete item[columnId];
      }

      return ({ contents });
    });
  }, []);

  return {
    query,
    setQuery,
    storage,
    handleLoadCsv,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    isEditing,
    setIsEditing,
    toggleEdit,
    showMissingTranslations,
    toggleShowMissingTranslations,
    handleAddKey,
    handleRemoveKey,
    handleAddLanguage,
    handleRemoveLanguage,
    focusedCell,
    setFocusedCell,
  };
});
