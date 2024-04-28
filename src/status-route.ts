import { Hono } from "hono";
import { StatusCode } from "hono/utils/http-status";
import { ollamaBaseURL, ollamaApiURL } from "./constants";

type OllamaTags = {
  models: Array<{ name: string }>;
};

const ollamaTagsURL = `${ollamaApiURL}/tags`;

export const statusRoute = new Hono();

statusRoute.get("", async (c) => {
  try {
    let ollamaResponse = await fetch(ollamaBaseURL);

    if (!ollamaResponse.ok) {
      const status = ollamaResponse.status as StatusCode;
      return c.json({ error: ollamaResponse.statusText }, status);
    }

    const ollama_status = await ollamaResponse.text();

    ollamaResponse = await fetch(ollamaTagsURL);

    if (!ollamaResponse.ok) {
      const status = ollamaResponse.status as StatusCode;
      return c.json({ error: ollamaResponse.statusText }, status);
    }

    const tags = (await ollamaResponse.json()) as OllamaTags;

    const available_models = tags.models.map(({ name }) => name);

    return c.json({
      status: "running",
      ollama_status,
      available_models,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
});
