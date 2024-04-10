import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma as db } from "../lib/prisma";
import {
  SchemaRouteParticipantsGET,
  SchemaRouteParticipantsPOST,
} from "../types/Participant";
import { RouterHandler } from "../types/RouterHandler";

export class ParticipantRouter {
  #router: FastifyInstance;
  constructor(router: FastifyInstance) {
    this.#router = router;
  }

  /**
   * Realiza o roteamento das rotas de participantes (/participants).
   */
  async route() {
    this.#router
      .withTypeProvider<ZodTypeProvider>()
      .get(
        "/participants",
        {
          schema: SchemaRouteParticipantsGET,
        },
        this.#listParticipants
      )
      .post(
        "/participants/:eventId",
        {
          schema: SchemaRouteParticipantsPOST,
        },
        this.#registerOnEvent
      );
  }

  /**
   * Listagem de participantes.
   */
  #listParticipants: RouterHandler<typeof SchemaRouteParticipantsGET> = async (
    req,
    rep
  ) => {
    const participants = await db.participants.findMany();
    return rep.status(200).send({
      message: `Listando ${participants.length} participantes`,
      data: participants,
    });
  };

  /**
   * Registro de participante em um evento.
   */
  #registerOnEvent: RouterHandler<typeof SchemaRouteParticipantsPOST> = async (
    req,
    rep
  ) => {
    const { eventId } = req.params;
    const { name, email } = req.body;

    const participantEmailRegisteredOnEvent = await db.participants.findUnique({
      where: {
        eventId_email: {
          email,
          eventId,
        },
      },
    });

    if (participantEmailRegisteredOnEvent) {
      return rep.status(400).send({
        message:
          "Já existe um participante com este email cadastrado neste evento.",
        data: null,
      });
    }

    const participantCreated = await db.participants.create({
      data: {
        name,
        email,
        eventId,
      },
    });

    return rep.status(201).send({
      message: "Participante foi registrado no evento com sucesso!",
      data: participantCreated,
    });
  };
}
