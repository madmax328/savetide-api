import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";

dotenv.config();

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true
});

await app.register(jwt, {
  secret: process.env.JWT_SECRET || "supersecret"
});

app.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

app.get("/", async () => {
  return { message: "SaveTide API running" };
});

app.register(authRoutes, { prefix: "/auth" });
app.register(productRoutes, { prefix: "/products" });

export default app;
