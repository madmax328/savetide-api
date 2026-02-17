require("dotenv").config();

const Fastify = require("fastify");
const cors = require("@fastify/cors");
const jwt = require("@fastify/jwt");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const axios = require("axios");
const Stripe = require("stripe");

const fastify = Fastify({ logger: true });
const stripe = new Stripe(process.env.STRIPE_SECRET);

// ================= DATABASE =================

mongoose.connect(process.env.MONGO_URI);

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  premium: { type: Boolean, default: false },
});

const TrackSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  title: String,
  price: Number,
});

const User = mongoose.model("User", UserSchema);
const Track = mongoose.model("Track", TrackSchema);

// ================= PLUGINS =================

fastify.register(cors, { origin: true });

fastify.register(jwt, {
  secret: process.env.JWT_SECRET,
});

const auth = async (req, reply) => {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
};

// ================= ROUTES =================

// Health check
fastify.get("/", async () => {
  return { status: "API Savetide OK" };
});

// Register
fastify.post("/register", async (req) => {
  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hash,
  });

  return { success: true };
});

// Login
fastify.post("/login", async (req, reply) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return reply.send({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return reply.send({ error: "Invalid password" });

  const token = fastify.jwt.sign({
    id: user._id,
    email: user.email,
  });

  return {
    token,
    premium: user.premium,
  };
});

// Product search via SERPAPI
fastify.get("/search", async (req) => {
  const { query, country } = req.query;

  const gl = country === "US" ? "us" : "fr";

  const url = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&gl=${gl}&api_key=${process.env.SERPAPI_KEY}`;

  const response = await axios.get(url);

  const results = response.data.shopping_results || [];

  const sorted = results.sort((a, b) => a.price - b.price);

  return sorted;
});

// Track product (premium)
fastify.post("/track", { preHandler: auth }, async (req) => {
  const { productId, title, price } = req.body;

  await Track.create({
    userId: req.user.id,
    productId,
    title,
    price,
  });

  return { success: true };
});

// Get tracked products
fastify.get("/track", { preHandler: auth }, async (req) => {
  const items = await Track.find({
    userId: req.user.id,
  });

  return items;
});

// Stripe subscription
fastify.post("/create-subscription", { preHandler: auth }, async (req) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "SavetiDE Premium",
          },
          unit_amount: 299,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    success_url: "https://savetide.com/success",
    cancel_url: "https://savetide.com/cancel",
  });

  return { url: session.url };
});

// ================= START =================

fastify.listen({
  port: process.env.PORT,
  host: "0.0.0.0",
});
