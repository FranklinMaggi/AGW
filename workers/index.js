import api from "./api.js";

export default {
  async fetch(request, env, ctx) {
    return api.fetch(request, env, ctx);
  }
};
