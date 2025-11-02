import { defineTable } from "@core/components/tables/defineTable.ts";
import { useMemo } from "react";
import { KeyBodyRowCell } from "../components/TranslationsTable/KeyBodyRowCell.tsx";
import { KeyHeadRowCell } from "../components/TranslationsTable/KeyHeadRowCell.tsx";
import { LanguageBodyRowCell } from "../components/TranslationsTable/LanguageBodyRowCell.tsx";
import { LanguageHeadRowCell } from "../components/TranslationsTable/LanguageHeadRowCell.tsx";
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
        HeadRowCell: key === "key" ? KeyHeadRowCell : LanguageHeadRowCell,
        BodyRowCell: key === "key" ? KeyBodyRowCell : LanguageBodyRowCell,
        searchFilter: (value: string, query) => value.toLowerCase().includes(query),
        columnFilter: (value: string, query) => value.toLowerCase().includes(query),
      })),
      props: {
        bodyRow: {
          className: `
            hover:**:data-source:bg-success-4  **:data-source:bg-success-5 data-even:**:data-source:bg-success-6
            hover:**:data-target:bg-info-4 **:data-target:bg-info-5 data-even:**:data-target:bg-info-6
          `,
        },
      },
      options: {
        columnFilters: { record: {} },
        searchFilter: { value: "" },
      },
    }), [storage?.contents]);
