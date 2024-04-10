import z from "zod";
import { SchemaEvent } from "./Event";
import { SchemaResponse } from "./Response";

export const SchemaParticipant = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().email(),
  subscribedAt: z.date(),
  checkInAt: z.date().nullable(),
  eventId: SchemaEvent.shape.id,
});

export const SchemaRouteParticipantsGET = {
  response: {
    200: SchemaResponse(SchemaParticipant.array()),
  },
};

export const SchemaRouteParticipantsPOST = {
  body: SchemaParticipant.pick({
    name: true,
    email: true,
  }),
  params: SchemaParticipant.pick({ eventId: true }),
  response: {
    201: SchemaResponse(SchemaParticipant),
  },
};
