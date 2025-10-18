import z from "zod";

export const entitySchema = z.object({
  /** The unique identifier of the entity */
  id: z.uuid(),
  /** The date the entity was created */
  createdAt: z.iso.datetime(),
  /** The date the entity was updated */
  updatedAt: z.iso.datetime(),
});

export interface Entity extends z.infer<typeof entitySchema> {}
