import { Hono } from "hono";
import { stream } from "hono/streaming";
import { StatusCode } from "hono/utils/http-status";

const ollamaURL = "http://localhost:11434/api";

export const ollama = new Hono();

ollama.post(":route", async (c) => {
  const route = c.req.param("route");

  const body = JSON.stringify(await c.req.json());

  try {
    const ollamaResponse = await fetch(`${ollamaURL}/${route}`, {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
    });

    if (!ollamaResponse.ok) {
      const status = ollamaResponse.status as StatusCode;
      return c.json({ error: ollamaResponse.statusText }, status);
    }

    return stream(c, async (stream) => {
      if (ollamaResponse.body) {
        await stream.pipe(ollamaResponse.body);
      }
      await stream.close();
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
});
