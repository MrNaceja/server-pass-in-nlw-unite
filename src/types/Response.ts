import z, { ZodSchema } from "zod";

export const SchemaResponse = (schemaData: ZodSchema) =>
  z.object({
    message: z.string(),
    data: schemaData,
  });
