import fastify from "fastify";
import { EventRouter } from "./routers/EventRouter";

const server = fastify(); // Instância do servidor

new EventRouter(server).route(); // Dispondo o controlador das rotas de eventos (/events)

server.listen({ port: 3333 }).then(() => {
  // Iniciando o servidor
  console.log("Server is running http://localhost:3333 🚀");
});
