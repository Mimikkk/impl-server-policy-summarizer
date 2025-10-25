import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Card } from "@core/components/containers/card/Card.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { createTable, type TableColumn, type TableRow } from "./createTable.tsx";
import { TranslationsViewProvider, useTranslationsView } from "./TranslationsView.context.tsx";

const Content = () => {
  const {
    handleLoadCsv,
    storage,
    query,
    setQuery,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    isEditing,
    toggleEdit,
    handleAddKey,
    handleAddLanguage,
    handleRemoveLanguage,
    showMissingTranslations,
    toggleShowMissingTranslations,
  } = useTranslationsView();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      ),
    [visibleRows, query],
  );

  const virtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

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
            <IconButton name="Upload" className="min-w-20 shrink-0" onClick={handleLoadCsv}>Load CSV</IconButton>
            <InputField
              compact
              label="Search..."
              value={query}
              onValueChange={setQuery}
              className="w-full"
            />
          </div>
          <Card label="csv content" compact className="px-2 py-1" color={storage ? "info" : "error"}>
            {storage
              ? (
                <div>
                  <span>Version:</span>
                  <span>{storage?.version && new Date(storage.version).toLocaleString()} - {storage?.filename}</span>
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
              <thead className="z-10 sticky top-0 left-0 bg-primary-6 text-left uppercase">
                <tr className="flex w-full items-center divide-x divide-primary-6 border-b border-primary-5 shadow shadow-primary-5">
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
                            <div className="flex justify-between w-full items-center px-2">
                              <span>{column.label}</span>
                              <IconButton
                                color="error"
                                name="Trash"
                                variant="text"
                                onClick={() => handleRemoveLanguage(column.id)}
                              />
                            </div>
                            <div className="flex w-full bg-primary-4">
                              <IconButton
                                className="flex-1 justify-start"
                                name={isSourceLanguage ? "BadgeCheck" : "Badge"}
                                color={isSourceLanguage ? "success" : "primary"}
                                active={isSourceLanguage}
                                onClick={() => {
                                  if (isTargetLanguage) {
                                    setTargetLanguage(null);
                                  }
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
                                  if (isSourceLanguage) {
                                    setSourceLanguage(null);
                                  }
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
                      <th className="flex-1" key={column.id}>
                        <div className="px-2 py-1 flex items-center justify-center">{column.label}</div>
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
                      className="
                      flex w-full items-stretch absolute top-0 left-0
                      divide-x divide-primary-6
                      min-h-10 h-full   
                      hover:bg-primary-4 bg-primary-5 even:bg-primary-6
                      hover:[&_[data-source]]:bg-success-4  [&_[data-source]]:bg-success-5 even:[&_[data-source]]:bg-success-6
                      hover:[&_[data-target]]:bg-info-4 [&_[data-target]]:bg-info-5 even:[&_[data-target]]:bg-info-6
                      "
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {table.columns.map((column) => <Cell key={column.id} row={row} column={column} />)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {isEditing
            ? <IconButton name="Plus" variant="solid" className="h-full  max-w-7" onClick={handleAddLanguage} />
            : <div />}
          {isEditing
            ? <IconButton name="Plus" variant="solid" className="w-full max-h-7" onClick={handleAddKey} />
            : <div />}
          <IconButton name={isEditing ? "Check" : "FilePen"} variant="solid" onClick={toggleEdit} />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div>
          <IconButton
            name={sourceLanguage ? "Check" : "TriangleAlert"}
            onClick={() => setSourceLanguage(null)}
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
            onClick={() => setTargetLanguage(null)}
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
        <div className="flex gap-2">
          <IconButton
            name={showMissingTranslations ? "Eye" : "EyeOff"}
            variant="solid"
            onClick={toggleShowMissingTranslations}
          >
            {showMissingTranslations ? "Show missing translations" : "Clear show missing translations"}
          </IconButton>
        </div>
      </div>
    </Card>
  );
};

const Cell = memo<{ row: TableRow<any>; column: TableColumn<any, any> }>(function Cell({ row, column }) {
  const {
    isEditing,
    sourceLanguage,
    targetLanguage,
    handleRemoveKey,
    focusedCell,
    setFocusedCell,
  } = useTranslationsView();

  const isSourceLanguage = sourceLanguage === column.id;
  const isTargetLanguage = targetLanguage === column.id;
  const [value, setValue] = useState(row.original[column.id]);

  useEffect(() => {
    setValue(row.original[column.id]);
  }, [row.original[column.id]]);

  return (
    <td
      data-source={isSourceLanguage ? "" : undefined}
      data-target={isTargetLanguage ? "" : undefined}
      className={clsx(
        "flex-1",
        !isEditing && "flex items-center px-[13px] overflow-auto",
      )}
    >
      <div className="flex justify-between h-full">
        {isEditing && column.id === "key" && (
          <IconButton
            name="Trash"
            variant="solid"
            color="error"
            onClick={() => handleRemoveKey(row.id)}
          />
        )}
        {isEditing
          ? (
            <InputField
              onFocus={() => setFocusedCell({ rowId: row.id, columnId: column.id })}
              onBlur={() => setFocusedCell(null)}
              className="w-full"
              color={focusedCell?.rowId === row.id && focusedCell?.columnId === column.id
                ? "secondary"
                : isSourceLanguage
                ? "success"
                : isTargetLanguage
                ? "info"
                : undefined}
              value={value}
              onValueChange={setValue}
              compact
            />
          )
          : <span className="flex items-center h-full">{value}</span>}
      </div>
    </td>
  );
});

export const TranslationsView = () => (
  <TranslationsViewProvider>
    <Content />
  </TranslationsViewProvider>
);
