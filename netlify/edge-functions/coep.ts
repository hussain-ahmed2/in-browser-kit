import type { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const response = await context.next();
  
  // Forcibly inject SharedArrayBuffer security headers into ALL responses.
  // This bypasses the Netlify Next.js plugin which aggressively strips headers from /_next/static/ chunks.
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  
  return response;
};
