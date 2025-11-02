import { defineTable } from "@core/components/tables/defineTable.ts";
import { useMemo } from "react";
import { KeyBodyRowCell } from "../components/TranslationsTable/KeyBodyRowCell.tsx";
import { KeyColumnCell } from "../components/TranslationsTable/KeyColumnCell.tsx";
import { LanguageBodyRowCell } from "../components/TranslationsTable/LanguageBodyRowCell.tsx";
import { LanguageColumnCell } from "../components/TranslationsTable/LanguageColumnCell.tsx";
import type { Storage } from "../TranslationsView.context.tsx";

interface useTranslationsTableProps {
  storage: Storage | undefined;
}

export const useTranslationsTable = ({ storage }: useTranslationsTableProps) =>
  useMemo(() =>
    defineTable({
      data: storage?.contents ?? [],
      columns: Object.keys(storage?.contents?.[0] ?? {}).map((key) => ({
        id: key,
        label: key,
        HeaderCell: key === "key" ? KeyColumnCell : LanguageColumnCell,
        RowCell: key === "key" ? KeyBodyRowCell : LanguageBodyRowCell,
      })),
      props: {
        tbody: {
          className: `
            hover:**:data-source:bg-success-4  **:data-source:bg-success-5 even:**:data-source:bg-success-6
            hover:**:data-target:bg-info-4 **:data-target:bg-info-5 even:**:data-target:bg-info-6
          `,
        },
      },
      options: {
        columnFilters: { record: {} },
        search: { value: "" },
      },
    }), [storage?.contents]);
