import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import slugify from "slugify";
import { prisma as db } from "../lib/prisma";
import {
  SchemaRouteEventsListAllGET,
  SchemaRouteEventsCreatePOST,
  SchemaRouteEventsGetByIdGET,
} from "../types/Event";
import { RouterSchemeHandler } from "../types/RouterSchemeHandler";

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
          schema: SchemaRouteEventsListAllGET,
        },
        this.#listEvents
      )
      .get(
        "/events/:id",
        {
          schema: SchemaRouteEventsGetByIdGET,
        },
        this.#getEventById
      )
      .post(
        "/events",
        {
          schema: SchemaRouteEventsCreatePOST,
        },
        this.#createEvent
      );
  }

  /**
   * Listagem de eventos.
   */
  #listEvents: RouterSchemeHandler<typeof SchemaRouteEventsListAllGET> = async (
    req,
    rep
  ) => {
    const events = await db.events.findMany();
    return rep.status(200).send({
      message: `Há ${events.length} eventos.`,
      data: events,
    });
  };

  /**
   * Busca o evento pelo id.
   */
  #getEventById: RouterSchemeHandler<typeof SchemaRouteEventsGetByIdGET> =
    async (req, rep) => {
      const { id } = req.params;

      const eventFounded = await db.events.findUnique({
        where: {
          id,
        },
      });

      if (!eventFounded) {
        return rep.status(404).send({
          message: "Opss, não há um evento com este ID.",
        });
      }

      return rep.status(200).send({
        message: "Evento evento encontrado com sucesso.",
        data: eventFounded,
      });
    };

  /**
   * Criação de evento.
   */
  #createEvent: RouterSchemeHandler<typeof SchemaRouteEventsCreatePOST> =
    async (req, rep) => {
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
          .status(400)
          .send({ message: "O Slug já existe, tente modificar o titulo." });
      }

      const eventCreated = await db.events.create({
        data: eventToCreate,
      });
      return rep.status(201).send({
        message: "Evento criado com sucesso.",
        data: eventCreated,
      });
    };
}
