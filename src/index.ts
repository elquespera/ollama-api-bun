import { Hono } from "hono";
import { logger } from "hono/logger";
import { ollama } from "./ollama-route";
import { basicAuth } from "hono/basic-auth";
import { verifyHMAC } from "./hmac";

const ollamaUser = process.env.OLLAMA_API_USER!;
const ollamaSecret = process.env.OLLAMA_API_SECRET!;

const app = new Hono();

app.use(logger());

app.get("/", (c) => c.json({ status: "Running" }));

app.use("api/*", async (c, next) => {
  const route = c.req.path;
  const body = JSON.stringify(await c.req.json());
  const isAuth = verifyHMAC(c.req.header("authorization"), route, "POST", body);

  if (!isAuth) {
    return c.json({ error: "Unauthorized request." }, 401);
  }

  await next();
});

app.route("/api/ollama", ollama);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
