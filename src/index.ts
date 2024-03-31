import { Hono } from "hono";
import { logger } from "hono/logger";
import { stream } from "hono/streaming";
import { StatusCode } from "hono/utils/http-status";
import { verifyHMAC } from "./hmac";

const ollamaURL = "http://localhost:11434/api";

const app = new Hono();

app.use(logger());

app.get("/", (c) => c.json({ status: "Running" }));

app.post("/api/ollama/:route", async (c) => {
  const route = c.req.param("route");

  console.log("ollama:", route);

  const body = JSON.stringify(await c.req.json());

  const isAuth = verifyHMAC(
    c.req.header("authorization"),
    `/api/ollama/${route}`,
    "POST",
    body
  );

  if (!isAuth) {
    return c.body("Unauthorized request.", 401);
  }

  try {
    const ollamaResponse = await fetch(`${ollamaURL}/${route}`, {
      method: "POST",
      body,
      headers: {
        "content-type": "application/json",
      },
    });

    if (!ollamaResponse.ok) {
      const status = ollamaResponse.status as StatusCode;
      c.status(status);
      return c.body(ollamaResponse.statusText, status);
    }

    return stream(c, async (stream) => {
      stream.onAbort(() => {
        console.log("Aborted!");
      });

      if (ollamaResponse.body) {
        await stream.pipe(ollamaResponse.body);
      }
      await stream.close();
    });
  } catch (error) {
    console.error(String(error));
    throw error;
  }
});

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
