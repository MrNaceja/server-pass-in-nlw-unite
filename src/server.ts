import fastify from "fastify";
import { EventRouter } from "./routers/EventRouter";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { ParticipantRouter } from "./routers/ParticipantRouter";

const server = fastify(); // Instância do servidor
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
