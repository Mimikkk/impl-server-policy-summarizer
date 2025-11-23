import { ServerClient } from "@clients/server/ServerClient.ts";
import type { TranslationSample } from "@clients/server/resources/TranslationResource.ts";
import { Param } from "@hooks/useLocalStorage.ts";
import { sleep } from "@utilities/common.ts";
import { defineContext } from "@utilities/defineContext.ts";
import { requestFilePicker, requestSaveFile } from "@utilities/requestFilePicker.ts";
import { useCallback, useEffect, useState } from "react";
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
const isEditingParam = Param.boolean({ key: "is-editing" });

const StorageParam = Param.new<Storage>({
  key: "translations-storage",
  serialize: (value) => JSON.stringify(value),
  deserialize: (value) => value ? JSON.parse(value) : undefined,
});

const useStorage = () => {
  const [storage, setStorage] = StorageParam.use();

  const loadCsv = useCallback(async () => {
    const file = await requestFilePicker({ types: ["text/csv"] });
    if (!file) return;

    const contents = await ServerClient.importCsv(file);
    setStorage({ version: Date.now(), filename: file.name, contents });
  }, []);

  const downloadCsv = useCallback(async () => {
    if (!storage?.contents || storage.contents.length === 0) return;

    const headers = Object.fromEntries(Object.keys(storage.contents[0]).map((key) => [key, key]));
    const data = storage.contents;

    const file = await ServerClient.exportCsv({ headers, data });
    requestSaveFile(file);
  }, [storage?.contents]);

  const updateStorage = useCallback((updater: Updater<Storage>) => {
    setStorage((s) => {
      const result = updater(s);
      if (result === undefined) return s;

      return ({ ...s, version: Date.now(), ...result });
    });
  }, []);

  return { storage, updateStorage, loadCsv, downloadCsv };
};

export const TranslationsViewContext = defineContext(() => {
  // storage module
  const { storage, updateStorage, loadCsv, downloadCsv } = useStorage();

  const [showMissingTranslations, setShowMissingTranslations] = ShowMissingTranslationsParam.use();
  const toggleShowMissingTranslations = useCallback(() => setShowMissingTranslations((x) => !x), []);

  const [showChangedTranslations, setShowChangedTranslations] = ShowChangedTranslationsParam.use();
  const toggleShowChangedTranslations = useCallback(() => setShowChangedTranslations((x) => !x), []);

  // table module
  const translationsTable = useTranslationsTable({
    storage,
  });

  useEffect(() => {
    translationsTable.features.externFilters.set([
      ({ values }) =>
        !showMissingTranslations || Object.entries(values).some(([id, value]) => {
          if (id === "key") return false;
          return value === "";
        }),
    ]);
  }, [showMissingTranslations, showChangedTranslations]);

  const getCellKey = useCallback((rowId: string, columnId: string) => `${rowId}:${columnId}`, []);
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);

  // form module
  const [isEditing, setIsEditing] = isEditingParam.use();

  const toggleEdit = useCallback(() => setIsEditing((x) => !x), []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleAddKey = useCallback(() => {
    updateStorage((s) => {
      if (s?.contents?.some(({ key }) => key === "")) {
        setFocusedCell({ rowId: ((s?.contents?.length ?? 0) - 1).toString(), columnId: "key" });
        return;
      }

      setFocusedCell({ rowId: (s?.contents?.length ?? 0).toString(), columnId: "key" });
      return ({ contents: [...s?.contents ?? [], { key: "", value: "" }] });
    });

    const element = translationsTable.refs.table?.parentElement;
    if (!element) return;

    requestAnimationFrame(() => {
      element.scrollTo(0, element.scrollHeight);

      requestAnimationFrame(() => {
        element.scrollTo(0, element.scrollHeight);
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
      const theadCellLastElement = translationsTable.refs.table?.querySelector<HTMLElement>(
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

  // AI actions
  const [processingCells, setProcessingCells] = useState<Set<string>>(new Set());
  const [processingColumns, setProcessingColumns] = useState<Set<string>>(new Set());

  const isCellProcessing = useCallback((rowId: string, columnId: string) => {
    return processingCells.has(getCellKey(rowId, columnId));
  }, [processingCells, getCellKey]);

  const isColumnProcessing = useCallback((columnId: string) => {
    return processingColumns.has(columnId);
  }, [processingColumns]);

  const addProcessingColumn = useCallback((columnId: string) => {
    setProcessingColumns((prev) => new Set(prev).add(columnId));
  }, []);

  const removeProcessingColumn = useCallback((columnId: string) => {
    setProcessingColumns((prev) => {
      const next = new Set(prev);
      next.delete(columnId);
      return next;
    });
  }, []);

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

  const [sourceLanguage, setSourceLanguage] = sourceLanguageParam.use();

  const [resultsQueue, setResultsQueue] = useState<PreviewResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);

  const buildSamples = useCallback((columnId: string, rowId?: string): TranslationSample[] => {
    if (!storage?.contents || !sourceLanguage) return [];

    return storage.contents
      .filter((_, index) => rowId === undefined || index.toString() !== rowId)
      .map((row) => ({
        original: row[sourceLanguage] || "",
        translation: row[columnId] || "",
      }))
      .filter((sample) => sample.original && sample.translation)
      .slice(0, 20);
  }, [storage?.contents, sourceLanguage]);

  const handleCellTranslate = useCallback(async (rowId: string, columnId: string) => {
    if (!sourceLanguage || !storage?.contents) {
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
        targetLanguage: columnId,
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
  }, [sourceLanguage, storage?.contents, buildSamples, addProcessingCell, removeProcessingCell]);

  const handleCellRegenerate = useCallback(async (rowId: string, columnId: string) => {
    if (!sourceLanguage || !storage?.contents) {
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
        targetLanguage: columnId,
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
  }, [sourceLanguage, storage?.contents, buildSamples, addProcessingCell, removeProcessingCell]);

  const handleCellVerify = useCallback(async (rowId: string, columnId: string) => {
    if (!sourceLanguage || !storage?.contents) {
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
        targetLanguage: columnId,
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
  }, [sourceLanguage, storage?.contents, buildSamples, addProcessingCell, removeProcessingCell]);

  const handleColumnFillInMissingTranslations = useCallback(async (language: string) => {
    addProcessingColumn(language);

    try {
      await sleep(1000);
    } catch (error) {
      console.error("Fill in missing translations failed:", error);
      alert("Fill in missing translations failed. Please try again.");
    } finally {
      removeProcessingColumn(language);
    }
  }, []);

  const handleColumnCheckGrammarSyntax = useCallback(async (language: string) => {
    addProcessingColumn(language);

    try {
      await sleep(1000);
    } catch (error) {
      console.error("Check grammar syntax failed:", error);
      alert("Check grammar syntax failed. Please try again.");
    } finally {
      removeProcessingColumn(language);
    }
  }, []);

  // review module

  const hasPendingReview = useCallback((rowId: string, columnId: string) => {
    return resultsQueue.some((result) => result.rowId === rowId && result.columnId === columnId);
  }, [resultsQueue]);

  const handleSelectResult = useCallback((index: number) => {
    setSelectedResultIndex(index);
  }, []);

  const currentResult = selectedResultIndex !== null ? resultsQueue[selectedResultIndex] ?? null : null;
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

  return {
    // Storage
    storage,
    loadCsv,
    downloadCsv,

    // Table
    translationsTable,
    /// Table filters
    showMissingTranslations,
    toggleShowMissingTranslations,
    showChangedTranslations,
    toggleShowChangedTranslations,
    isCellProcessing,
    isColumnProcessing,
    focusedCell,
    setFocusedCell,
    /// Table actions
    handleAddKey,
    handleRemoveKey,
    handleAddLanguage,
    handleRemoveLanguage,

    // Form elements
    isEditing,
    setIsEditing,
    toggleEdit,
    handleCancel,
    handleSave,

    // AI Actions
    sourceLanguage,
    setSourceLanguage,

    handleCellTranslate,
    handleCellRegenerate,
    handleCellVerify,

    handleColumnFillInMissingTranslations,
    handleColumnCheckGrammarSyntax,

    // Review module
    currentResult,
    resultsQueue,
    selectedResultIndex,
    hasPendingReview,
    handleSelectResult,
    handlePreviewAccept,
    handlePreviewReject,
  };
});
