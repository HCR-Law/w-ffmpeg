// server.ts
import { Elysia, status } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { convert } from "./convert";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .listen(3000)
  .use(cors())
  .use(openapi())
  .use(opentelemetry())
  .get("/", () => "Hello Elysia")
  .post("/api/v1/convert/to/:out", async (ctx) => {
    const bytes = await ctx.request.bytes();
    const contentType = ctx.headers["content-type"]; // e.g audio/webm
    const inFile = new Blob([bytes], { type: contentType });
    const outType = ctx.params.out;

    if (!contentType) {
      return status(400, "Missing Content-Type header");
    }

    const cTypeParts = contentType.split("/");
    const inType = cTypeParts.at(-1);

    if (!inType) {
      return status(400, "Unable to parse Content-Type header");
    }

    if (cTypeParts[0] !== "audio") {
      return new Response("Unsupported Content-Type", {
        status: 415,
        headers: {
          "Accept": "audio/*",
        }
      })
    }

    console.log({
      outType,
      contentType,
      size: inFile.size,
    });

    const outFile = await convert(inType, outType, inFile);
    return outFile;
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
