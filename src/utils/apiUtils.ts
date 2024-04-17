// Small workaround as over Hono and Cloudflare Workers I cannot access the env variables globally. As it's either in the Hono context or in the Cloudflare Worker Env.
// Passing the Hono "c" context to every method instead. Also because instances are not persistent (Deploying without Durable Objects support)

import type { Context } from "hono";
import type { Order } from "../schemas/objects";

export const buyStock = async (c: Context, body: Order) => {
	try {
		return fetch(`${c.env.APCA_HOST}/orders`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Apca-Api-Key-Id": c.env.APCA_API_KEY_ID,
				"Apca-Api-Secret-Key": c.env.APCA_API_SECRET_KEY,
			},
			body: JSON.stringify(body),
		});
	} catch (err) {
		console.error(err);
		throw new Error(err);
	}
};
