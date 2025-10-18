import { z } from "zod";

const environmentSchema = z.object({
  /* Clients */
  Clients: z.object({
    /* Server URL - http://localhost:3000/docs/ui */
    ServerUrl: z.string().min(1),
    /* Eli URL - https://api.sejm.gov.pl/eli/openapi/ui/ */
    EliUrl: z.string().min(1),
  }),
});

export interface Environment extends z.infer<typeof environmentSchema> {}

export const Environment = environmentSchema.parse({
  Clients: {
    ServerUrl: import.meta.env.CLIENT_SERVER_URL,
    EliUrl: import.meta.env.CLIENT_ELI_URL,
  },
});
