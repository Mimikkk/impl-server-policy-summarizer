import { ServerClient } from "@clients/server/ServerClient.ts";
import { Param } from "@hooks/useLocalStorage.ts";
import { createContext } from "@utilities/createContext.tsx";
import { requestFilePicker } from "@utilities/requestFilePicker.ts";
import { useCallback, useRef, useState } from "react";

type Updater<T> = (value: T) => Partial<T> | undefined;
interface Storage {
  version: number;
  filename: string;
  contents: Record<string, string>[];
}

const ShowMissingTranslationsParam = Param.boolean({ key: "show-missing-translations" });
const ShowChangedTranslationsParam = Param.boolean({ key: "show-changed-translations" });
const StorageParam = Param.new<Storage>({
  key: "translations-storage",
  serialize: (value) => JSON.stringify(value),
  deserialize: (value) => value ? JSON.parse(value) : undefined,
});

const QueryParam = Param.string({ key: "query" });
const KeyQueryParam = Param.string({ key: "filters[key]" });

export const [useTranslationsView, TranslationsViewProvider] = createContext(() => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showMissingTranslations, setShowMissingTranslations] = ShowMissingTranslationsParam.use();
  const [showChangedTranslations, setShowChangedTranslations] = ShowChangedTranslationsParam.use();
  const toggleShowMissingTranslations = useCallback(() => setShowMissingTranslations((x) => !x), []);
  const toggleShowChangedTranslations = useCallback(() => setShowChangedTranslations((x) => !x), []);

  const [focusedCell, setFocusedCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = useCallback(() => setIsEditing((x) => !x), []);

  const [storage, setStorage] = StorageParam.use();

  const handleLoadCsv = useCallback(async () => {
    const file = await requestFilePicker({ types: ["text/csv"] });
    if (!file) return;

    const contents = await ServerClient.importCsv(file);
    setStorage({ version: Date.now(), filename: file.name, contents });
  }, []);

  const [query, setQuery] = QueryParam.use();
  const [keyQuery, setKeyQuery] = KeyQueryParam.use();

  const updateStorage = useCallback((updater: Updater<Storage>) => {
    setStorage((s) => {
      const result = updater(s);
      if (result === undefined) return s;

      return ({ ...s, version: Date.now(), ...result });
    });
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleAddKey = useCallback(() => {
    updateStorage((s) => {
      if (s?.contents?.some((item) => item.key === "")) {
        setFocusedCell({ rowId: ((s?.contents?.length ?? 0) - 1).toString(), columnId: "key" });
        return;
      }

      setFocusedCell({ rowId: (s?.contents?.length ?? 0).toString(), columnId: "key" });
      return ({ contents: [...s?.contents ?? [], { key: "", value: "" }] });
    });

    requestAnimationFrame(() => {
      scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current?.scrollHeight ?? 0 });
    });
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
    requestAnimationFrame(() => {
      const theadCellLastElement = scrollContainerRef.current?.querySelector<HTMLElement>(
        "thead th:last-child input",
      );

      if (theadCellLastElement) {
        theadCellLastElement.focus();
      }
    });
  }, []);

  const handleRemoveLanguage = useCallback((columnId: string) => {
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
    keyQuery,
    setKeyQuery,
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
    showChangedTranslations,
    toggleShowChangedTranslations,
    handleAddKey,
    handleRemoveKey,
    handleAddLanguage,
    handleRemoveLanguage,
    focusedCell,
    setFocusedCell,
    scrollContainerRef,
    handleCancel,
    handleSave,
  };
});
