import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {Events as ModelEvent} from "@prisma/client"
import slugify from "slugify";
import z, { ZodType } from "zod";
import { prisma as db } from "../lib/prisma";

// Schema de criação de evento
const SchemaCreateEvent = z.object({
  title: z.string().min(4),
  details: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
});

const SchemaEvent = z.exobject({
    id: z.string(),
    title: z.string(),
    details: string | null.
    slug: string;
    maxParticipants: number | null
})

const SchemaResponse = z.object({
  message: z.string(),
  data: z.any(),
});

export class EventRouter {
  #router: FastifyInstance;
  constructor(router: FastifyInstance) {
    this.#router = router;
  }

  /**
   * Realiza o roteamento das rotas de eventos (/events).
   */
  async route() {
    return this.#router
      .withTypeProvider<ZodTypeProvider>()
      .get(
        "/events",
        {
          schema: {
            response: {
              200: z.array(),
            },
          },
        },
        this.listEvents
      )
      .post(
        "/events",
        {
          schema: {
            body: SchemaCreateEvent,
            response: {
              201: SchemaResponse,
            },
          },
        },
        this.createEvent
      );
  }

  /**
   * Listagem de eventos.
   */
  listEvents: RouteHandlerMethod = async (req, rep) => {
    const events = await db.events.findMany();
    return rep.status(200).send(events);
  };

  /**
   * Criação de evento.
   */
  createEvent: RouteHandlerMethod = async (req, rep) => {
    const receivedData = SchemaCreateEvent.safeParse(req.body);

    if (!receivedData.success) {
      return rep.status(401).send(receivedData.error.format());
    }

    const eventToCreate = {
      ...receivedData.data,
      slug: slugify(receivedData.data.title),
    };

    const hasEventBySlug = await db.events.findUnique({
      where: { slug: eventToCreate.slug },
    });

    if (hasEventBySlug) {
      return rep
        .status(401)
        .send({ message: "O Slug já existe, tente modificar o titulo." });
    }

    const eventCreated = await db.events.create({
      data: eventToCreate,
    });
    return rep.status(201).send({
      message: "Evento criado com sucesso!",
      data: eventCreated,
    });
  };
}
