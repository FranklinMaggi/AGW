import { cors } from "./cors.js";

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: cors("application/json"),
  });
}
