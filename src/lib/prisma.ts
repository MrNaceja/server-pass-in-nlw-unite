import { PrismaClient } from "@prisma/client";

//Conexão com banco de dados gerenciado pelo prisma ORM
export const prisma = new PrismaClient({
  log: ["query"],
});
