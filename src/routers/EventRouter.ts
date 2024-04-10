import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import slugify from "slugify";
import { prisma as db } from "../lib/prisma";
import { SchemaRouteEventsGET, SchemaRouteEventsPOST } from "../types/Event";
import { RouterHandler } from "../types/RouterHandler";

export class EventRouter {
  #router: FastifyInstance;
  constructor(router: FastifyInstance) {
    this.#router = router;
  }

  /**
   * Realiza o roteamento das rotas de eventos (/events).
   */
  async route() {
    this.#router
      .withTypeProvider<ZodTypeProvider>()
      .get(
        "/events",
        {
          schema: SchemaRouteEventsGET,
        },
        this.#listEvents
      )
      .post(
        "/events",
        {
          schema: SchemaRouteEventsPOST,
        },
        this.#createEvent
      );
  }

  /**
   * Listagem de eventos.
   */
  #listEvents: RouterHandler<typeof SchemaRouteEventsGET> = async (
    req,
    rep
  ) => {
    const events = await db.events.findMany();
    return rep.status(200).send({
      message: `Listando ${events.length} eventos`,
      data: events,
    });
  };

  /**
   * Criação de evento.
   */
  #createEvent: RouterHandler<typeof SchemaRouteEventsPOST> = async (
    req,
    rep
  ) => {
    const { title, details, maxParticipants } = req.body;

    const eventToCreate = {
      title,
      details,
      maxParticipants,
      slug: slugify(title),
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
