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

export const SchemaRouteEventsGET = {
  response: {
    200: SchemaResponse(SchemaEvent.array()),
  },
};

export const SchemaRouteEventsPOST = {
  body: SchemaCreateEvent,
  response: {
    201: SchemaResponse(SchemaEvent),
  },
};
