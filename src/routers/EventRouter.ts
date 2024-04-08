import { PrismaClient } from "@prisma/client";
import { FastifyInstance, RouteHandlerMethod } from "fastify";
import z from "zod";

// Schema de criação de evento
const SchemaCreateEvent = z.object({
  title: z.string().min(4),
  details: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
});

//Conexão com banco de dados gerenciado pelo prisma ORM
const db = new PrismaClient({
  log: ["query"],
});

export class EventRouter {
  #router: FastifyInstance;
  constructor(router: FastifyInstance) {
    this.#router = router;
  }

  /**
   * Realiza o roteamento.
   */
  route() {
    this.#router
      .get("/events", this.listEvents)
      .post("/events", this.createEvent);
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
      return rep.status(500).send(receivedData.error.format());
    }

    const eventCreated = await db.events.create({
      data: {
        ...receivedData.data,
        slug: new Date().toISOString(),
      },
    });
    return rep.status(201).send({
      message: "Evento criado com sucesso!",
      data: eventCreated,
    });
  };
}
