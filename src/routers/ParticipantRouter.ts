import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma as db } from "../lib/prisma";
import {
  SchemaRouteParticipantsCredentialsByIdGET,
  SchemaRouteParticipantsListAllGET,
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
        "/participants",
        {
          schema: SchemaRouteParticipantsListAllGET,
        },
        this.#listParticipants
      )
      .get(
        "/participants/:id/credentials",
        {
          schema: SchemaRouteParticipantsCredentialsByIdGET,
        },
        this.#getParticipantCredentialsById
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
   * Listagem de participantes.
   */
  #listParticipants: RouterSchemeHandler<
    typeof SchemaRouteParticipantsListAllGET
  > = async (req, rep) => {
    const participants = await db.participants.findMany();
    return rep.status(200).send({
      message: `Listando ${participants.length} participantes.`,
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
      return rep.status(401).send({
        message:
          "Opss, não foram encontradas as credenciais deste participante.",
        data: null,
      });
    }

    return rep.status(200).send({
      message: "Credenciais do Participante encontradas com sucesso.",
      data: participantCredentials,
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
      return rep.status(401).send({
        message: "Opss, Evento não encontrado.",
        data: null,
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
      return rep.status(401).send({
        message: `Opss, O limite de ${maxParticipants} participante(s) para o evento foi atingido.`,
        data: null,
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
      message: "Participante foi registrado no evento com sucesso.",
      data: participantCreated,
    });
  };
}
