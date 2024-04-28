import { Hono } from "hono";
import { logger } from "hono/logger";
import { ollamaRoute } from "./ollama-route";
import { verifyHMAC } from "./hmac";
import { statusRoute } from "./status-route";

const app = new Hono();

app.use(logger());

app.use("api/*", async (c, next) => {
  const route = c.req.path;
  const body = JSON.stringify(await c.req.json());
  const isAuth = verifyHMAC(c.req.header("authorization"), route, "POST", body);

  if (!isAuth) {
    return c.json({ error: "Unauthorized request." }, 401);
  }

  await next();
});

app.route("/api/ollama", ollamaRoute);
app.route("/status", statusRoute);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
