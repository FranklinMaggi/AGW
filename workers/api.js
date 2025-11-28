import { cors } from "./core/cors.js";
import { json } from "./core/json.js";
import { userRoutes } from "./routes/user.js";
import { adminRoutes } from "./routes/admin.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // Handle OPTIONS
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }

    // USER ROUTES
    const u = await userRoutes(url, method, request, env);
    if (u) return u;

    // ADMIN ROUTES
    const a = await adminRoutes(url, method, request, env);
    if (a) return a;

    return json({ ok: false, error: "NOT_FOUND" }, 404);
  },
};
