import { defineContext } from "@utilities/defineContext.tsx";
import type { Table } from "../../defineTable.tsx";

export const TableContext = defineContext(({ store }: { store: Table<any, any> }) => store);
