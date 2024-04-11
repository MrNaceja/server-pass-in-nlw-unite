import z from "zod";
import { SchemaResponse } from "./Response";

export const SchemaEvent = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  details: z.string().nullable(),
  maxParticipants: z.number().int().nullable(),
});

export const SchemaCreateEvent = SchemaEvent.pick({
  title: true,
  details: true,
  maxParticipants: true,
});

export const SchemaRouteEventsListAllGET = {
  summary: "Lista todos os eventos",
  tags: ["/events"],
  response: {
    200: SchemaResponse(SchemaEvent.array()),
  },
};

export const SchemaRouteEventsGetByIdGET = {
  summary: "Retorna as informações de um evento a partir de seu ID",
  tags: ["/events"],
  params: SchemaEvent.pick({ id: true }),
  response: {
    200: SchemaResponse(SchemaEvent),
  },
};

export const SchemaRouteEventsCreatePOST = {
  summary: "Cria um evento",
  tags: ["/events"],
  body: SchemaCreateEvent,
  response: {
    201: SchemaResponse(SchemaEvent),
  },
};
