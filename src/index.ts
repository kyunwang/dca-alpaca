import type { ScheduledEvent } from "@cloudflare/workers-types";
import { Hono, type ExecutionContext } from "hono";

import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import { bearerAuth } from "hono/bearer-auth";
import api from "./api";

interface Env {
	DB_ALPACA_DCA: KVNamespace;
	// ... other binding types
}

const app = new Hono();

api.use("*", logger());
api.use("*", prettyJSON());
api.use("/api/*", cors());

app.use("/api/*", (ctx, next) => {
	const tokenMiddleware = bearerAuth({
		token: ctx.env.WORKER_API_TOKEN,
	});
	return tokenMiddleware(ctx, next);
});

app.route("/api", api);



export default {
	fetch: app.fetch,
	scheduled: async (batch: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
		// NOTE: Ensuring that the worker is only accessible via the API token
		// Scheduled events are isolated through Cloudflare so gets a pass by default.
		// Token should be part of Cloudflare auth in case of an implementation of Frontend
		
		try {
			console.log("Endpoint", env.DCA_ENDPOINT);

			const res = await env.BINDING_ALPACA_DCA.fetch(env.DCA_ENDPOINT, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${env.WORKER_API_TOKEN}`,
				},
			});

			console.log("Scheduled event response", res.status, res.statusText);
		} catch (error) {
			console.error("Cron error", JSON.stringify(error));
		}
	},
};
