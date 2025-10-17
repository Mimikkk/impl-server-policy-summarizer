import { z } from "@hono/zod-openapi";
import { upperFirst } from "@utilities/messages.ts";
import type { BuildColumns } from "drizzle-orm";
import {
  integer,
  type SQLiteColumnBuilderBase,
  sqliteTable,
  type SQLiteTableWithColumns,
  text,
} from "drizzle-orm/sqlite-core";
import { type BuildRefine, type BuildSchema, createSchemaFactory, type NoUnknownKeys } from "drizzle-zod";

const createUuid = () => crypto.randomUUID();
const createTimestamp = () => new Date();

type ColumnRecord = Record<string, SQLiteColumnBuilderBase>;
type Coerce = true | Partial<Record<"string" | "number" | "bigint" | "boolean" | "date", true>> | undefined;

type ResultTable<TName extends string, TFields extends ColumnRecord> = SQLiteTableWithColumns<{
  name: TName;
  schema: undefined;
  columns: BuildColumns<TName, TFields & typeof entityFields, "sqlite">;
  dialect: "sqlite";
}>;

type ResultRefine<TName extends string, TFields extends ColumnRecord> = BuildRefine<
  ResultTable<TName, TFields & typeof entityFields>["_"]["columns"],
  Coerce
>;

export interface EntityOptions<
  TName extends string,
  TFields extends ColumnRecord,
  TRefine extends ResultRefine<TName, TFields>,
> {
  tableName: TName;
  resourceName: string;
  columns: TFields;
  refine: Omit<NoUnknownKeys<TRefine, ResultTable<TName, TFields>["$inferSelect"]>, keyof typeof entityRefine>;
  description: string;
}

const entityFields = {
  id: text("id").primaryKey()
    .$default(createUuid),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull()
    .$default(createTimestamp),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
    .$default(createTimestamp).$onUpdate(createTimestamp),
};

const entityRefine = {
  id: (z) =>
    z.openapi({
      example: "c0a95e2d-e6a7-4edd-8cd5-e252ac0f02cf",
      description: "The unique identifier of the resource.",
    }),
  createdAt: (z) =>
    z.openapi({
      example: "2021-01-01",
      description: "When the resource was created.",
    }),
  updatedAt: (z) =>
    z.openapi({
      example: "2021-01-01",
      description: "When the resource was last updated.",
    }),
} satisfies ResultRefine<string, {}>;

type Entity<TName extends string, TFields extends ColumnRecord, TRefine extends ResultRefine<TName, TFields>> = {
  table: ResultTable<TName, TFields>;
  schema: BuildSchema<"select", ResultTable<TName, TFields>["_"]["columns"], TRefine, Coerce>;
};

export const { createInsertSchema, createSelectSchema, createUpdateSchema } = createSchemaFactory({ zodInstance: z });

export const defineEntity = <
  const TName extends string,
  const TFields extends Record<keyof TFields, SQLiteColumnBuilderBase>,
  const TRefine extends ResultRefine<TName, TFields>,
>(
  { tableName, resourceName, columns: fields, refine: schemaRefine, description }: EntityOptions<
    TName,
    TFields,
    TRefine
  >,
): Entity<TName, TFields, TRefine> => {
  const table = sqliteTable(tableName, { ...fields, ...entityFields });

  const refine = {
    ...entityRefine,
    ...schemaRefine,
  } as never;

  const schema = createSelectSchema(table, refine).openapi(
    `Persistence / Resources / ${upperFirst(resourceName)}Resource`,
    { description },
  ) as never;

  return { table, schema };
};
