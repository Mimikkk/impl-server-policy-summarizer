import { z } from "@hono/zod-openapi";
import { samples } from "./samples.ts";

type ParamShape = z.ZodType<any, any, any>;

export const defineParam = <T extends ParamShape>(options: ParamOptions<T>): ParamOptions<T> => options;
type ParamOptions<T extends ParamShape = ParamShape> = T;

export const ParamsContext = {
  common: {
    id: z.string().openapi({
      description: "Resource identifier",
      example: samples.ids.uuid,
    }),
  },
};

export const defineParams = <const T extends z.core.$ZodLooseShape>(
  options: T | ((context: typeof ParamsContext) => T),
): z.ZodObject<T> => {
  if (typeof options === "function") {
    options = options(ParamsContext);
  }

  return z.object(options);
};
