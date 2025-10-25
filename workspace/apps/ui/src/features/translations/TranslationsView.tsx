import { ServerQuery } from "@clients/server/ServerClient.ts";
import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Card } from "@core/components/containers/card/Card.tsx";
import { useLocalStorage } from "@hooks/useLocalStorage.ts";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";

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

  const [stored, setStored] = useLocalStorage<{ version: number; contents: Record<string, string>[] }>({
    key: "csv-contents",
    serialize: (value) => JSON.stringify(value),
    deserialize: (value) => value ? JSON.parse(value) : undefined,
  });

  const { data: contents, status: contentsStatus } = ServerQuery.useCsv(csv!, {
    enabled: !!csv,
    initialData: stored?.contents,
  });

  useEffect(() => {
    if (!contents) return;
    setStored({ version: Date.now(), contents });
  }, [contents]);

  console.log({ contents, contentsStatus });

  const table = createTable({
    data: contents ?? [],
    columns: Object.keys(contents?.[0] ?? {}).map((key) => ({
      id: key,
      label: key,
    })),
  });
  const [selectedCells, setSelectedCells] = useState<Cell<InferData<typeof table>>[]>([]);

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

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div>Loaded CSV: {csv?.name}</div>
          <IconButton
            name={sourceLanguage ? "Check" : "X"}
            onClick={() => setSourceLanguage(null)}
            className="flex items-center gap-1"
          >
            <span className="font-bold">source language:</span>
            <span>{sourceLanguage}</span>
          </IconButton>
          <IconButton
            name={targetLanguage ? "Check" : "X"}
            onClick={() => setTargetLanguage(null)}
            className="flex items-center gap-1"
          >
            <span className="font-bold">target language:</span>
            <span>{targetLanguage}</span>
          </IconButton>
        </div>
        <div className="flex gap-2">
          <IconButton name="Upload" className="min-w-20" onClick={handleLoadCsv}>Load CSV</IconButton>
          <IconButton name="Plus" className="min-w-20">Add language</IconButton>
        </div>
      </div>
      {contentsStatus === "success" && (
        <table className="bg-primary-5 rounded-sm w-full border border-primary-6">
          <thead
            className={clsx(
              "bg-primary-4 border-primary-6",
              "[&>td]:bg-secondary-3 [&>td]:border-secondary-6",
            )}
          >
            <tr>
              {table.columns.map((column) => {
                const isSelectable = column.id !== "key";
                const isSourceLanguage = sourceLanguage === column.id;
                const isTargetLanguage = targetLanguage === column.id;

                if (isSelectable) {
                  return (
                    <th className="p-1" key={column.id} data-source={isSourceLanguage} data-target={isTargetLanguage}>
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
          <tbody className="bg-primary-3 overflow-scroll h-[500px]">
            {table.rows.map((row) => (
              <tr key={row.id} className="hover:bg-primary-4 border border-primary-5">
                {table.columns.map((column) => {
                  const isSelected = selectedCells.some((cell) => cell.rowId === row.id && cell.columnId === column.id);

                  return (
                    <td
                      className={clsx("p-1 cursor-pointer active:bg-primary-5", { "bg-primary-4": isSelected })}
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
      )}
    </Card>
  );
};
