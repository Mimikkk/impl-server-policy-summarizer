import { ServerQuery } from "@clients/server/ServerClient.ts";
import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Card } from "@core/components/containers/card/Card.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import { useDebounceState } from "@hooks/useDebounceState.tsx";
import { useLocalStorage } from "@hooks/useLocalStorage.ts";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";

type Id<TData> = keyof TData | (string & {});

interface Column<TData, TId extends Id<TData> = Id<TData>> {
  id: TId;
  label: string;
}

interface Row<TData> {
  original: TData;
  id: string;
}

interface CreateTableProps<TData, TColumns extends Column<TData, Id<TData>>[]> {
  data: TData[];
  columns: TColumns;
}

interface Table<TData, TColumns extends Column<TData, Id<TData>>[]> {
  rows: Row<TData>[];
  columns: TColumns;
}

interface Cell<TData> {
  columnId: Id<TData>;
  rowId: string;
}

type InferData<T extends Table<any, any>> = T extends Table<infer TData, any> ? TData : never;

const createTable = <TData, TColumns extends Column<TData, Id<TData>>[]>(
  { data, columns }: CreateTableProps<TData, TColumns>,
): Table<TData, TColumns> => ({ rows: data.map((item, index) => ({ original: item, id: index.toString() })), columns });

export const TranslationsView = () => {
  const [csv, setCsv] = useState<File | null>(null);

  const [stored, setStored] = useLocalStorage<{
    version: number;
    filename: string;
    contents: Record<string, string>[];
  }>({
    key: "csv-contents",
    serialize: (value) => JSON.stringify(value),
    deserialize: (value) => value ? JSON.parse(value) : undefined,
  });

  const { data: contents, status: contentsStatus } = ServerQuery.useCsv(csv!, {
    enabled: !!csv,
    initialData: stored?.contents,
  });

  useEffect(() => {
    if (!contents || !csv) return;
    setStored({ version: Date.now(), filename: csv.name, contents });
  }, [csv?.name, contents]);

  console.log({ contents, contentsStatus });

  const handleLoadCsv = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,text/csv";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0];

      if (file) setCsv(file);
    };
    input.click();
  }, []);

  const [sourceLanguage, setSourceLanguage] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useDebounceState(query, setQuery, 200);

  const [data, setData] = useState<Record<string, string>[]>(contents ?? []);

  const rows = useMemo(
    () =>
      data?.filter((content) =>
        Object.values(content).some((value) => value.toLowerCase().includes(debouncedQuery.toLowerCase()))
      ) ?? [],
    [data, debouncedQuery],
  );

  const table = createTable({
    data: rows,
    columns: Object.keys(contents?.[0] ?? {}).map((key) => ({
      id: key,
      label: key,
    })),
  });
  const [selectedCells, setSelectedCells] = useState<Cell<InferData<typeof table>>[]>([]);

  const handleNewRow = useCallback(() => {
  }, []);

  const handleNewLanguage = useCallback(() => {
  }, []);

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <IconButton
            name={sourceLanguage ? "Check" : "X"}
            onClick={() => setSourceLanguage(null)}
            className="flex items-center gap-1 min-w-52 justify-start"
            color={sourceLanguage ? "success" : "error"}
          >
            <span className="font-bold">source language:</span>
            <span>{sourceLanguage}</span>
          </IconButton>
          <IconButton
            name={targetLanguage ? "Check" : "X"}
            onClick={() => setTargetLanguage(null)}
            className="flex items-center gap-1 min-w-52 justify-start"
            color={targetLanguage ? "success" : "error"}
          >
            <span className="font-bold">target language:</span>
            <span>{targetLanguage}</span>
          </IconButton>
        </div>
        <div className="flex flex-col">
          <div className="flex w-full gap-2">
            <IconButton name="Upload" className="min-w-20 shrink-0" onClick={handleLoadCsv}>Load CSV</IconButton>
            <InputField
              compact
              label="Search..."
              value={debouncedQuery}
              onValueChange={setDebouncedQuery}
              className="w-full"
            />
          </div>
          <Card label="fileinfo" compact className="p-1" color={stored ? "info" : "error"}>
            {stored
              ? (
                <div>
                  <span>Version:</span>
                  <span>{stored?.version && new Date(stored.version).toLocaleString()} - {stored?.filename}</span>
                </div>
              )
              : <div className="text-center text-primary-10">No selected file.</div>}
          </Card>
        </div>
      </div>
      {contentsStatus === "success" && (
        <div className="grid grid-cols-[1fr_auto] gap-2 grid-rows-[1fr_auto]">
          <div className="border border-primary-6 bg-primary-5 w-full overflow-scroll block h-[500px] relative rounded-sm">
            <table>
              <thead
                className={clsx(
                  "sticky top-0 left-0",
                  "bg-primary-4",
                )}
              >
                <tr>
                  {table.columns.map((column) => {
                    const isSelectable = column.id !== "key";
                    const isSourceLanguage = sourceLanguage === column.id;
                    const isTargetLanguage = targetLanguage === column.id;

                    if (isSelectable) {
                      return (
                        <th
                          className={clsx(
                            "p-1",
                            isSourceLanguage && "bg-success-7",
                            isTargetLanguage && "bg-info-7",
                          )}
                          key={column.id}
                          data-source={isSourceLanguage}
                          data-target={isTargetLanguage}
                        >
                          <div className="flex items-center gap-1">
                            <IconButton
                              name={isSourceLanguage ? "BadgeCheck" : "Badge"}
                              onClick={() => {
                                if (isTargetLanguage) {
                                  setTargetLanguage(null);
                                }
                                return setSourceLanguage(column.id);
                              }}
                            />
                            <IconButton
                              name={isTargetLanguage ? "BadgeCheck" : "Badge"}
                              onClick={() => {
                                if (isSourceLanguage) {
                                  setSourceLanguage(null);
                                }
                                return setTargetLanguage(column.id);
                              }}
                            />
                            <span>{column.label}</span>
                          </div>
                        </th>
                      );
                    }

                    return <th className="p-1" key={column.id}>{column.label}</th>;
                  })}
                </tr>
              </thead>
              <tbody className="bg-primary-3">
                {table.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-primary-4">
                    {table.columns.map((column) => {
                      const isSelected = selectedCells.some((cell) =>
                        cell.rowId === row.id && cell.columnId === column.id
                      );
                      const isSourceLanguage = sourceLanguage === column.id;
                      const isTargetLanguage = targetLanguage === column.id;

                      return (
                        <td
                          className={clsx(
                            "p-1 cursor-pointer active:bg-primary-5 border",
                            isSourceLanguage && "bg-success-4 border-success-5",
                            isTargetLanguage && "bg-info-4 border-info-5",
                            !isSourceLanguage && !isTargetLanguage && "border-primary-5",
                          )}
                          onClick={() =>
                            setSelectedCells((prev) => {
                              if (isSelected) {
                                return prev.filter((cell) => cell.rowId !== row.id || cell.columnId !== column.id);
                              }

                              return [...prev, { rowId: row.id, columnId: column.id }];
                            })}
                          key={column.id}
                        >
                          {row.original[column.id]}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <IconButton name="Plus" variant="solid" className="h-full flex-col max-w-7 justify-start">
            <span style={{ textOrientation: "upright", writingMode: "vertical-rl" }}>Language</span>
          </IconButton>
          <IconButton name="Plus" variant="solid" className="h-7 w-full justify-start">
            Add new row
          </IconButton>
        </div>
      )}
    </Card>
  );
};
