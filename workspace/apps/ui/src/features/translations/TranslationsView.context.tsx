import { ServerClient } from "@clients/server/ServerClient.ts";
import type { TranslationSample } from "@clients/server/resources/TranslationResource.ts";
import { Param } from "@hooks/useLocalStorage.ts";
import { defineContext } from "@utilities/defineContext.ts";
import { requestFilePicker } from "@utilities/requestFilePicker.ts";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { PreviewResult } from "./ReviewModal.tsx";
import { useTranslationsTable } from "./hooks/useTranslationsTable.tsx";
import type { FocusedCell } from "./types.ts";

type Updater<T> = (value: T) => Partial<T> | undefined;

export interface Storage {
  version: number;
  filename: string;
  contents: Record<string, string>[];
}

const ShowMissingTranslationsParam = Param.boolean({ key: "show-missing-translations" });
const ShowChangedTranslationsParam = Param.boolean({ key: "show-changed-translations" });
const sourceLanguageParam = Param.string({ key: "source-language" });
const targetLanguageParam = Param.string({ key: "target-language" });

const StorageParam = Param.new<Storage>({
  key: "translations-storage",
  serialize: (value) => JSON.stringify(value),
  deserialize: (value) => value ? JSON.parse(value) : undefined,
});

export const TranslationsViewContext = defineContext(() => {
  const [showMissingTranslations, setShowMissingTranslations] = ShowMissingTranslationsParam.use();
  const [showChangedTranslations, setShowChangedTranslations] = ShowChangedTranslationsParam.use();
  const toggleShowMissingTranslations = useCallback(() => setShowMissingTranslations((x) => !x), []);
  const toggleShowChangedTranslations = useCallback(() => setShowChangedTranslations((x) => !x), []);

  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);
  const [sourceLanguage, setSourceLanguage] = sourceLanguageParam.use();
  const [targetLanguage, setTargetLanguage] = targetLanguageParam.use();
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = useCallback(() => setIsEditing((x) => !x), []);

  const [resultsQueue, setResultsQueue] = useState<PreviewResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);
  const [processingCells, setProcessingCells] = useState<Set<string>>(new Set());

  const getCellKey = useCallback((rowId: string, columnId: string) => `${rowId}:${columnId}`, []);

  const addProcessingCell = useCallback((rowId: string, columnId: string) => {
    setProcessingCells((prev) => new Set(prev).add(getCellKey(rowId, columnId)));
  }, [getCellKey]);

  const removeProcessingCell = useCallback((rowId: string, columnId: string) => {
    setProcessingCells((prev) => {
      const next = new Set(prev);
      next.delete(getCellKey(rowId, columnId));
      return next;
    });
  }, [getCellKey]);

  const isCellProcessing = useCallback((rowId: string, columnId: string) => {
    return processingCells.has(getCellKey(rowId, columnId));
  }, [processingCells, getCellKey]);

  const hasPendingReview = useCallback((rowId: string, columnId: string) => {
    return resultsQueue.some((result) => result.rowId === rowId && result.columnId === columnId);
  }, [resultsQueue]);

  const [storage, setStorage] = StorageParam.use();

  const handleLoadCsv = useCallback(async () => {
    const file = await requestFilePicker({ types: ["text/csv"] });
    if (!file) return;

    const contents = await ServerClient.importCsv(file);
    setStorage({ version: Date.now(), filename: file.name, contents });
  }, []);

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
      translationsTableScrollContainerRef.current?.scrollTo({
        top: translationsTableScrollContainerRef.current?.scrollHeight ?? 0,
      });
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
      const theadCellLastElement = translationsTableScrollContainerRef.current?.querySelector<HTMLElement>(
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

  const buildSamples = useCallback((excludeRowId?: string): TranslationSample[] => {
    if (!storage?.contents || !sourceLanguage || !targetLanguage) return [];
    return storage.contents
      .filter((_, index) => excludeRowId === undefined || index.toString() !== excludeRowId)
      .map((row) => ({
        original: row[sourceLanguage] || "",
        translation: row[targetLanguage] || "",
      }))
      .filter((sample) => sample.original && sample.translation)
      .slice(0, 20);
  }, [storage?.contents, sourceLanguage, targetLanguage]);

  const handleCellTranslate = useCallback(async (rowId: string, columnId: string) => {
    if (!sourceLanguage || !targetLanguage || !storage?.contents) {
      alert("Please select both source and target languages.");
      return;
    }

    const row = storage.contents[+rowId];
    if (!row) return;

    const original = row[sourceLanguage];
    if (!original) {
      alert("Source language cell is empty.");
      return;
    }

    addProcessingCell(rowId, columnId);

    try {
      const samples = buildSamples(rowId);
      const result = await ServerClient.translate({
        samples,
        sourceLanguage,
        targetLanguage,
        original,
        alternativesCount: 3,
      });

      setResultsQueue((prev) => [...prev, {
        type: "translate",
        original,
        currentTranslation: row[columnId],
        translations: result.translations,
        rowId,
        columnId,
      }]);
    } catch (error) {
      console.error("Translation failed:", error);
      alert("Translation failed. Please try again.");
    } finally {
      removeProcessingCell(rowId, columnId);
    }
  }, [sourceLanguage, targetLanguage, storage?.contents, buildSamples, addProcessingCell, removeProcessingCell]);

  const handleCellRegenerate = useCallback(async (rowId: string, columnId: string) => {
    if (!sourceLanguage || !targetLanguage || !storage?.contents) {
      alert("Please select both source and target languages.");
      return;
    }

    const row = storage.contents[+rowId];
    if (!row) return;

    const original = row[sourceLanguage];
    const translation = row[columnId];

    if (!original) {
      alert("Source language cell is empty.");
      return;
    }

    if (!translation) {
      alert("Target translation is empty. Use translate instead.");
      return;
    }

    addProcessingCell(rowId, columnId);

    try {
      const samples = buildSamples(rowId);
      const result = await ServerClient.regenerate({
        samples,
        sourceLanguage,
        targetLanguage,
        original,
        translation,
        alternativesCount: 3,
      });

      setResultsQueue((prev) => [...prev, {
        type: "regenerate",
        original,
        currentTranslation: translation,
        translations: result.translations,
        rowId,
        columnId,
      }]);
    } catch (error) {
      console.error("Regeneration failed:", error);
      alert("Regeneration failed. Please try again.");
    } finally {
      removeProcessingCell(rowId, columnId);
    }
  }, [sourceLanguage, targetLanguage, storage?.contents, buildSamples, addProcessingCell, removeProcessingCell]);

  const handleCellVerify = useCallback(async (rowId: string, columnId: string) => {
    if (!sourceLanguage || !targetLanguage || !storage?.contents) {
      alert("Please select both source and target languages.");
      return;
    }

    const row = storage.contents[+rowId];
    if (!row) return;

    const original = row[sourceLanguage];
    const translation = row[columnId];

    if (!original || !translation) {
      alert("Both source and target cells must have content.");
      return;
    }

    addProcessingCell(rowId, columnId);

    try {
      const samples = buildSamples(rowId);
      const verification = await ServerClient.verify({
        samples,
        sourceLanguage,
        targetLanguage,
        original,
        translation,
      });

      setResultsQueue((prev) => [...prev, {
        type: "verify",
        original,
        translation,
        verification,
        rowId,
        columnId,
      }]);
    } catch (error) {
      console.error("Verification failed:", error);
      alert("Verification failed. Please try again.");
    } finally {
      removeProcessingCell(rowId, columnId);
    }
  }, [sourceLanguage, targetLanguage, storage?.contents, buildSamples, addProcessingCell, removeProcessingCell]);

  const currentResult = selectedResultIndex !== null ? resultsQueue[selectedResultIndex] ?? null : null;

  const handleSelectResult = useCallback((index: number) => {
    setSelectedResultIndex(index);
  }, []);

  const handlePreviewAccept = useCallback((selectedTranslation?: string) => {
    if (selectedResultIndex === null || !currentResult) {
      return;
    }

    if (currentResult.type !== "verify" && selectedTranslation) {
      const { rowId, columnId } = currentResult;
      updateStorage((s) => {
        const contents = structuredClone(s?.contents ?? []);
        if (contents[+rowId]) {
          contents[+rowId][columnId] = selectedTranslation;
        }
        return { contents };
      });
    }

    setResultsQueue((prev) => prev.filter((_, idx) => idx !== selectedResultIndex));
    setSelectedResultIndex(null);
  }, [selectedResultIndex, currentResult, updateStorage]);

  const handlePreviewReject = useCallback(() => {
    if (selectedResultIndex === null) {
      return;
    }

    setResultsQueue((prev) => prev.filter((_, idx) => idx !== selectedResultIndex));
    setSelectedResultIndex(null);
  }, [selectedResultIndex]);

  const translationsTable = useTranslationsTable({ storage });
  const translationsTableScrollContainerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const table = document.querySelector("table");
    if (!table) return;

    translationsTableScrollContainerRef.current = table.parentElement as HTMLDivElement;
  }, []);

  return {
    translationsTable,

    // Storage
    storage,
    handleLoadCsv,

    // Language selectors
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,

    // Form elements
    isEditing,
    setIsEditing,
    toggleEdit,
    handleCancel,
    handleSave,

    // Table filters
    showMissingTranslations,
    toggleShowMissingTranslations,
    showChangedTranslations,
    toggleShowChangedTranslations,

    // Table actions
    handleAddKey,
    handleRemoveKey,
    handleAddLanguage,
    handleRemoveLanguage,

    // focus handler
    focusedCell,
    setFocusedCell,

    // Review module
    currentResult,
    resultsQueue,
    selectedResultIndex,
    hasPendingReview,

    handleSelectResult,
    handleCellTranslate,
    handleCellRegenerate,
    handleCellVerify,

    handlePreviewAccept,
    handlePreviewReject,

    isCellProcessing,
  };
});
