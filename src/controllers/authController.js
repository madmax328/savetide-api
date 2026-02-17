import bcrypt from "bcrypt";
import User from "../models/User.js";

export const register = async (req, reply) => {
  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hash
  });

  const token = req.server.jwt.sign({
    id: user._id,
    email: user.email
  });

  return { token, user };
};

export const login = async (req, reply) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return reply.code(401).send({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return reply.code(401).send({ error: "Invalid credentials" });
  }

  const token = req.server.jwt.sign({
    id: user._id,
    email: user.email
  });

  return { token, user };
};

export const me = async (req) => {
  return req.user;
};

