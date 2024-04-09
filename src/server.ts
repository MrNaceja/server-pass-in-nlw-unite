import fastify from "fastify";
import { EventRouter } from "./routers/EventRouter";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

const server = fastify(); // Instância do servidor
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

const oEventRoutes = new EventRouter(server);
server.register(oEventRoutes.route.bind(oEventRoutes)); // Dispondo o controlador das rotas de eventos (/events)

server.listen({ port: 3333 }).then(() => {
  // Iniciando o servidor
  console.log("Server is running http://localhost:3333 🚀");
});
