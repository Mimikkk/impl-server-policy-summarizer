import { z } from "@hono/zod-openapi";
import type { ColumnBuilderBase } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSchemaFactory } from "drizzle-zod";

const createUuid = () => crypto.randomUUID();
const createTimestamp = () => new Date();

export const entityFields = {
  id: text("id").primaryKey()
    .$default(createUuid),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull()
    .$default(createTimestamp),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
    .$default(createTimestamp).$onUpdate(createTimestamp),
};

export type EntityOptions<TName, TFields> = { name: TName; fields: TFields };

export const defineEntity = <
  const TName extends string,
  const TFields extends Record<keyof TFields, ColumnBuilderBase>,
>({ name, fields }: EntityOptions<TName, TFields>) => {
  return sqliteTable(name, { ...entityFields, ...fields });
};

export const { createInsertSchema, createSelectSchema, createUpdateSchema } = createSchemaFactory({ zodInstance: z });
