import { ServerClient } from "@clients/server/ServerClient.ts";
import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Card } from "@core/components/containers/card/Card.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import { Text } from "@core/components/typography/Text.tsx";
import { useVirtualizer } from "@tanstack/react-virtual";
import { requestSaveFile } from "@utilities/requestFilePicker.ts";
import clsx from "clsx";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createTable, type TableColumn, type TableRow } from "./createTable.tsx";
import { TranslationPreviewModal } from "./TranslationPreviewModal.tsx";
import { TranslationsViewProvider, useTranslationsView } from "./TranslationsView.context.tsx";

const Content = () => {
  const {
    handleLoadCsv,
    storage,
    keyQuery,
    setKeyQuery,
    query,
    setQuery,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    isEditing,
    toggleEdit,
    handleCancel,
    handleSave,
    handleAddKey,
    handleAddLanguage,
    handleRemoveLanguage,
    scrollContainerRef,
    showMissingTranslations,
    toggleShowMissingTranslations,
    showChangedTranslations,
    toggleShowChangedTranslations,
    currentResult,
    resultsQueue,
    selectedResultIndex,
    handleSelectResult,
    handlePreviewAccept,
    handlePreviewReject,
  } = useTranslationsView();

  const table = useMemo(() =>
    createTable({
      data: storage?.contents ?? [],
      columns: Object.keys(storage?.contents?.[0] ?? {}).map((key) => ({ id: key, label: key })),
    }), [storage?.contents]);

  const visibleRows = useMemo(() => {
    return showMissingTranslations
      ? table.rows.filter((row) => table.columns.some((column) => !row.original[column.id]))
      : table.rows;
  }, [table.rows, table.columns, showMissingTranslations]);

  const filteredRows = useMemo(
    () =>
      visibleRows.filter((row) =>
        !query || table.columns.some((column) => row.original[column.id].toLowerCase().includes(query.toLowerCase()))
      ).filter(
        (row) => !keyQuery || row.original.key.toLowerCase().includes(keyQuery.toLowerCase()),
      ),
    [visibleRows, query, keyQuery],
  );

  const virtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 30,
    overscan: 5,
  });

  const handleDownloadCsv = useCallback(async () => {
    if (storage?.contents?.length === 0) return;

    const headers = Object.fromEntries(Object.keys(storage.contents[0]).map((key) => [key, key]));
    const data = storage.contents;

    const file = await ServerClient.exportCsv({ headers, data });
    requestSaveFile(file);
  }, [storage?.contents]);

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex justify-between gap-2">
        <div className="flex gap-2 content-start self-start">
          <IconButton name="Plus" variant="solid" className="min-w-40" onClick={handleAddLanguage}>
            New language
          </IconButton>
          <IconButton name="Plus" variant="solid" className="min-w-40" onClick={handleAddKey}>
            New key
          </IconButton>
        </div>
        <div className="flex flex-col">
          <div className="flex w-full gap-2">
            <IconButton variant="solid" name="Upload" className="min-w-20 shrink-0" onClick={handleLoadCsv}>
              Load CSV
            </IconButton>
            <div className="flex w-full">
              <InputField
                compact
                label="Search..."
                value={query}
                onValueChange={setQuery}
                className="w-full"
              />
              <IconButton className="shrink-0" name="Search" variant="solid" />
            </div>
          </div>
          <Card label="csv content" compact className="pl-2 pr-1 py-1" color={storage ? "info" : "error"}>
            {storage
              ? (
                <div className="flex items-center gap-2">
                  <span>Version:</span>
                  <span>{storage?.version && new Date(storage.version).toLocaleString()} - {storage?.filename}</span>
                  <IconButton color="success" name="Download" variant="solid" onClick={handleDownloadCsv} />
                </div>
              )
              : <div className="text-center text-primary-10">No selected file.</div>}
          </Card>
        </div>
      </div>
      {storage && (
        <div className="grid grid-cols-[1fr_auto] gap-2 grid-rows-[1fr_auto]">
          <div
            ref={scrollContainerRef}
            className="overflow-auto block h-[500px] relative border border-primary-6 rounded-sm"
          >
            <table className="border-separate w-full" cellSpacing="0" cellPadding="0">
              <thead className="z-10 sticky top-0 left-0 bg-primary-6 text-left">
                <tr className="flex w-full divide-x divide-primary-6 border-b border-primary-5 shadow shadow-primary-5">
                  {table.columns.map((column) => {
                    const isSelectable = column.id !== "key";
                    const isSourceLanguage = sourceLanguage === column.id;
                    const isTargetLanguage = targetLanguage === column.id;

                    if (isSelectable) {
                      return (
                        <th
                          className={clsx(
                            "flex-1",
                            isSourceLanguage && "bg-success-7",
                            isTargetLanguage && "bg-info-7",
                            !isSourceLanguage && !isTargetLanguage && "bg-primary-7",
                          )}
                          key={column.id}
                          data-source={isSourceLanguage}
                          data-target={isTargetLanguage}
                        >
                          <div className="flex flex-col items-center">
                            <div className="flex justify-between w-full items-center h-7">
                              {isEditing
                                ? (
                                  <>
                                    <HeaderCell column={column} />
                                    <IconButton
                                      color="error"
                                      name="Trash"
                                      variant="solid"
                                      onClick={() => handleRemoveLanguage(column.id)}
                                    />
                                  </>
                                )
                                : <span className="px-3">{column.label}</span>}
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
                                source language
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
                                target language
                              </IconButton>
                            </div>
                          </div>
                        </th>
                      );
                    }

                    return (
                      <th className="flex-1 h-auto" key={column.id}>
                        <div className="flex flex-col items-center">
                          <div className="flex justify-between w-full items-center h-7">
                            <span className="px-3">{column.label}</span>
                          </div>
                          <div className="flex justify-between w-full items-center h-7">
                            <InputField
                              compact
                              value={keyQuery}
                              onValueChange={setKeyQuery}
                              className="h-full w-full"
                            />
                            <IconButton name="Search" variant="solid" />
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const row = filteredRows[virtualRow.index];
                  return (
                    <tr
                      key={row.id}
                      className={clsx(
                        `
                      flex w-full items-stretch absolute top-0 left-0
                      divide-x divide-primary-6
                      min-h-7.5 h-full   
                      hover:bg-primary-4 bg-primary-5 even:bg-primary-6
                      hover:[&_[data-source]]:bg-success-4  [&_[data-source]]:bg-success-5 even:[&_[data-source]]:bg-success-6
                      hover:[&_[data-target]]:bg-info-4 [&_[data-target]]:bg-info-5 even:[&_[data-target]]:bg-info-6
                      `,
                      )}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {table.columns.map((column) => <BodyCell key={column.id} row={row} column={column} />)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {isEditing
            ? (
              <IconButton
                name="Plus"
                variant="solid"
                className="h-full  max-w-7"
                title="Add language"
                onClick={handleAddLanguage}
              />
            )
            : <div className="w-7" />}

          <div className="col-span-full flex items-center gap-2 w-full justify-end">
            {isEditing && (
              <IconButton
                name="Plus"
                variant="solid"
                className="w-full max-h-7"
                title="Add key"
                onClick={handleAddKey}
              />
            )}
            {!isEditing && (
              <IconButton name="FilePen" variant="solid" className="" onClick={toggleEdit}>
                Toggle edit
              </IconButton>
            )}
            {isEditing && <IconButton color="error" title="Cancel" name="X" variant="solid" onClick={handleCancel} />}
            {isEditing && <IconButton color="success" name="Check" title="Save" variant="solid" onClick={handleSave} />}
          </div>
          <div className="flex items-center gap-1 col-span-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Text light>
                  Filtered rows:
                </Text>
                <div className="flex items-center gap-1">
                  <span>{filteredRows.length}</span>
                  <span>/</span>
                  <span>{table.rows.length}</span>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-1">
                <Text light className="flex items-center gap-1">
                  <IconButton
                    name={showMissingTranslations ? "EyeOff" : "Eye"}
                    variant="solid"
                    color={showMissingTranslations ? "info" : "primary"}
                    onClick={toggleShowMissingTranslations}
                  />
                  Missing rows:
                </Text>
                <div className="flex items-center gap-1">
                  <span>{filteredRows.length}</span>
                </div>
                {isEditing && (
                  <>
                    <Text light className="flex items-center gap-1">
                      <IconButton
                        name={showChangedTranslations ? "EyeOff" : "Eye"}
                        variant="solid"
                        color={showChangedTranslations ? "info" : "primary"}
                        onClick={toggleShowChangedTranslations}
                      />
                      Changed rows:
                    </Text>
                    <div className="flex items-center gap-1">
                      <span>{filteredRows.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div>
          <IconButton
            name={sourceLanguage ? "Check" : "TriangleAlert"}
            onClick={() => setSourceLanguage("")}
            className="flex items-center gap-1 min-w-52 justify-start"
            color={sourceLanguage ? "success" : "warning"}
          >
            {sourceLanguage
              ? (
                <>
                  <span className="font-bold">source language:</span>
                  <span>{sourceLanguage}</span>
                </>
              )
              : <span className="font-bold">Select source language...</span>}
          </IconButton>
          <IconButton
            name={targetLanguage ? "Check" : "TriangleAlert"}
            onClick={() => setTargetLanguage("")}
            className="flex items-center gap-1 min-w-52 justify-start"
            color={targetLanguage ? "info" : "warning"}
          >
            {targetLanguage
              ? (
                <>
                  <span className="font-bold">target language:</span>
                  <span>{targetLanguage}</span>
                </>
              )
              : <span className="font-bold">Select target language...</span>}
          </IconButton>
        </div>
        <div className="flex gap-2">
          <IconButton name="WandSparkles" variant="solid">
            Fill in missing translations
          </IconButton>
          <IconButton name="BrainCircuit" variant="solid">
            Check grammar & syntax
          </IconButton>
          <IconButton name="RotateCcw" variant="solid">
            Regenerate translations
          </IconButton>
        </div>
        <div className="flex flex-col gap-2 max-w-80">
          <IconButton
            name={showMissingTranslations ? "EyeOff" : "Eye"}
            variant="solid"
            onClick={toggleShowMissingTranslations}
            className="w-full"
            color={showMissingTranslations ? "info" : "primary"}
          >
            {showMissingTranslations ? "Clear show missing translations" : "Show missing translations"}
          </IconButton>
          <IconButton
            name={showChangedTranslations ? "EyeOff" : "Eye"}
            variant="solid"
            onClick={toggleShowChangedTranslations}
            className="w-full"
            color={showChangedTranslations ? "info" : "primary"}
          >
            {showChangedTranslations ? "Clear show changed translations" : "Show changed translations"}
          </IconButton>
        </div>
      </div>
      {resultsQueue.length > 0 && (
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Text light className="font-bold">Pending Reviews:</Text>
            <Text>{resultsQueue.length} {resultsQueue.length === 1 ? "result" : "results"}</Text>
          </div>
          <div className="flex flex-wrap gap-2">
            {resultsQueue.slice(0, 6).map((result, idx) => {
              const icon = result.type === "translate"
                ? "WandSparkles"
                : result.type === "regenerate"
                ? "RotateCcw"
                : "BrainCircuit";
              const color = result.type === "translate" ? "success" : result.type === "regenerate" ? "warning" : "info";
              const label = result.type === "translate"
                ? "Translate"
                : result.type === "regenerate"
                ? "Regenerate"
                : "Verify";

              return (
                <IconButton
                  key={idx}
                  name={icon}
                  variant="solid"
                  color={color}
                  className={selectedResultIndex === idx ? "ring-2 ring-offset-2 ring-info-7" : ""}
                  title={`${label} for row ${result.rowId}, column ${result.columnId}`}
                  onClick={() => handleSelectResult(idx)}
                >
                  {label}
                </IconButton>
              );
            })}
            {resultsQueue.length > 6 && (
              <IconButton
                name="Plus"
                variant="solid"
                color="secondary"
                title={`${resultsQueue.length - 6} more results`}
              >
                +{resultsQueue.length - 6}
              </IconButton>
            )}
          </div>
        </Card>
      )}
      <TranslationPreviewModal
        result={currentResult}
        onAccept={handlePreviewAccept}
        onReject={handlePreviewReject}
      />
    </Card>
  );
};

const inputColorMap = {
  focused: "secondary",
  source: "success",
  target: "info",
  none: undefined,
} as const;
const buttonColorMap = {
  focused: "secondary",
  source: "info",
  target: "success",
  none: undefined,
} as const;
const BodyCell = memo<{ row: TableRow<any>; column: TableColumn<any, any> }>(function Cell({ row, column }) {
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
});

const HeaderCell = memo<{ column: TableColumn<any, any> }>(function HeaderCell({ column }) {
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

export const TranslationsView = () => (
  <TranslationsViewProvider>
    <Content />
  </TranslationsViewProvider>
);
