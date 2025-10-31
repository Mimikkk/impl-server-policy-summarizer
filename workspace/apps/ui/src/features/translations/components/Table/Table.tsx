import { memo } from "react";
import type { Table as TableType } from "../../defineTable.tsx";
import { TranslationsViewContext } from "../../TranslationsView.context.tsx";
import { TableBody } from "./TableBody.tsx";
import { TableContext } from "./TableContext.tsx";
import { TableHead } from "./TableHead.tsx";

export const Table = memo(function store({ store }: { store: TableType<any, any> }) {
  return (
    <TableContext.Provider store={store}>
      <Content />
    </TableContext.Provider>
  );
});

const Content = memo(function Content() {
  const scrollContainerRef = TranslationsViewContext.use((s) => s.scrollContainerRef);

  return (
    <div ref={scrollContainerRef} className="overflow-auto block h-[500px] relative border border-primary-6 rounded-sm">
      <table className="border-separate w-full" cellSpacing="0" cellPadding="0">
        <TableHead />
        <TableBody />
      </table>
    </div>
  );
});
