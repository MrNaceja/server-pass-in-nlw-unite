import fastify from "fastify";
import { EventRouter } from "./routers/EventRouter";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { ParticipantRouter } from "./routers/ParticipantRouter";

import DocsBuilder from "@fastify/swagger";
import DocsUI from "@fastify/swagger-ui";

const server = fastify(); // Instância do servidor

server.register(DocsBuilder, {
  // Contruindo a documentação da API
  swagger: {
    consumes: ["application/json"],
    produces: ["application/json"],
    info: {
      title: "Pass.in API",
      description: "API Node Pass.in desenvolvida no NLW Unite da Rocketseat.",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

server.register(DocsUI, {
  // Disponibilizando a rota de visualização da UI das API
  prefix: "/docs",
});

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

const oEventRoutes = new EventRouter(server);
const oParticipantRoutes = new ParticipantRouter(server);

server.register(oEventRoutes.route.bind(oEventRoutes)); // Dispondo as rotas de eventos (/events)
server.register(oParticipantRoutes.route.bind(oParticipantRoutes)); // Dispondo as rotas de participantes (/participants)

server.listen({ port: 3333 }).then(() => {
  // Iniciando o servidor
  console.log("Server is running http://localhost:3333 🚀");
});
