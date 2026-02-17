import { register, login, me } from "../controllers/authController.js";

export default async function (fastify) {
  fastify.post("/register", register);
  fastify.post("/login", login);
  fastify.get("/me", { preHandler: [fastify.authenticate] }, me);
}

