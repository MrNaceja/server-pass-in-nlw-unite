import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma as db } from "../lib/prisma";
import {
  SchemaRouteParticipantsCheckInGET,
  SchemaRouteParticipantsCredentialsByIdGET,
  SchemaRouteParticipantsListAllOnEventGET,
  SchemaRouteParticipantsRegisterOnEventPOST,
} from "../types/Participant";
import { RouterSchemeHandler } from "../types/RouterSchemeHandler";

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
        "/participants/:eventId",
        {
          schema: SchemaRouteParticipantsListAllOnEventGET,
        },
        this.#listParticipantsOnEvent
      )
      .get(
        "/participants/:id/credentials",
        {
          schema: SchemaRouteParticipantsCredentialsByIdGET,
        },
        this.#getParticipantCredentialsById
      )
      .get(
        "/participants/:id/check-in",
        {
          schema: SchemaRouteParticipantsCheckInGET,
        },
        this.#checkIn
      )
      .post(
        "/participants/:eventId",
        {
          schema: SchemaRouteParticipantsRegisterOnEventPOST,
        },
        this.#registerOnEvent
      );
  }

  /**
   * Listagem de participantes no evento.
   */
  #listParticipantsOnEvent: RouterSchemeHandler<
    typeof SchemaRouteParticipantsListAllOnEventGET
  > = async (req, rep) => {
    const evento = req.params;
    const { page, query, limit } = req.query;

    const participants = await db.participants.findMany({
      where: query
        ? {
            ...evento,
            name: {
              contains: query,
            },
          }
        : evento,
      take: limit,
      skip: page * limit,
      orderBy: {
        subscribedAt: "desc",
      },
    });
    return rep.status(200).send({
      message: `Há ${participants.length} participantes no evento.`,
      data: participants,
    });
  };

  /**
   * Busca as credenciais do participante pelo id.
   */
  #getParticipantCredentialsById: RouterSchemeHandler<
    typeof SchemaRouteParticipantsCredentialsByIdGET
  > = async (req, rep) => {
    const { id } = req.params;

    const participantCredentials = await db.participants.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        email: true,
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!participantCredentials) {
      return rep.status(404).send({
        message:
          "Opss, não foram encontradas as credenciais deste participante.",
      });
    }

    const checkInUrl = new URL(
      `/participants/${id}/check-in`,
      process.env.API_SERVER_URL
    ).toString();

    return rep.status(200).send({
      message: "Credenciais do Participante encontradas com sucesso.",
      data: {
        ...participantCredentials,
        checkInUrl,
      },
    });
  };

  /**
   * Registro de participante em um evento.
   */
  #registerOnEvent: RouterSchemeHandler<
    typeof SchemaRouteParticipantsRegisterOnEventPOST
  > = async (req, rep) => {
    const { eventId } = req.params;
    const { name, email } = req.body;

    const eventInfo = await db.events.findUnique({
      where: {
        id: eventId,
      },
      select: {
        _count: {
          select: {
            participants: true,
          },
        },
        maxParticipants: true,
      },
    });

    if (!eventInfo) {
      return rep.status(404).send({
        message: "Opss, Evento não encontrado.",
      });
    }
    const {
      maxParticipants,
      _count: { participants: amountParticipantRegisteredOnEvent },
    } = eventInfo;

    if (
      maxParticipants &&
      amountParticipantRegisteredOnEvent >= maxParticipants
    ) {
      return rep.status(400).send({
        message: `Opss, O limite de ${maxParticipants} participante(s) para o evento foi atingido.`,
      });
    }

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
      message: "Participante foi registrado no evento com sucesso.",
      data: participantCreated,
    });
  };

  #checkIn: RouterSchemeHandler<typeof SchemaRouteParticipantsCheckInGET> =
    async (req, rep) => {
      const { id } = req.params;

      const participant = await db.participants.findUnique({
        where: {
          id,
        },
        select: {
          checkInAt: true,
        },
      });

      if (!participant) {
        return rep.status(404).send({
          message: "Participante não registrado.",
        });
      }

      if (participant.checkInAt) {
        return rep
          .status(400)
          .send({ message: "Participante já efetuou check-in." });
      }

      participant.checkInAt = new Date(); // Registrando o check-in
      await db.participants.update({
        data: participant,
        where: {
          id,
        },
      });

      return rep.status(200).send({
        message: "Check-in efetuado com sucesso.",
      });
    };
}
