import z from "zod";
import { SchemaEvent } from "./Event";
import { SchemaResponse } from "./Response";
import { FastifySchema } from "fastify";

export const SchemaParticipant = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().email(),
  subscribedAt: z.date(),
  checkInAt: z.date().nullable(),
  eventId: SchemaEvent.shape.id,
});

export const SchemaRouteParticipantsListAllOnEventGET = {
  params: SchemaParticipant.pick({ eventId: true }),
  querystring: z.object({
    page: z.string().optional().default("0").transform(Number),
    query: z.string().optional(),
    limit: z.string().default("10").transform(Number),
  }),
  response: {
    200: SchemaResponse(SchemaParticipant.array()),
  },
};

export const SchemaRouteParticipantsCredentialsByIdGET = {
  params: z.object({ id: z.coerce.number().int() }),
  response: {
    200: SchemaResponse(
      SchemaParticipant.pick({
        name: true,
        email: true,
      }).merge(
        z.object({
          event: SchemaEvent.pick({ title: true }),
          checkInUrl: z.string().url(),
        })
      )
    ),
  },
};

export const SchemaRouteParticipantsCheckInGET = {
  params: z.object({ id: z.coerce.number().int() }),
  response: {
    200: SchemaResponse(),
  },
};

export const SchemaRouteParticipantsRegisterOnEventPOST = {
  body: SchemaParticipant.pick({
    name: true,
    email: true,
  }),
  params: SchemaParticipant.pick({ eventId: true }),
  response: {
    201: SchemaResponse(SchemaParticipant),
  },
};
