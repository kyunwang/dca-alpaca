import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { OrderParser, StockConfigParser } from "../schemas/objects";
import { doesStockExist, getStocksForToday } from "../utils";
import { buyStock } from "../utils/apiUtils";

const app = new Hono();

app.get("/", async (c) => {
	// const value = await c.env.DB_ALPACA_DCA.list();
	// return new Response(JSON.stringify(value.keys));
	// return new Response(value.keys);

	return c.text("API route");
});

// Trigger manually by calling this route
// Will bypass the schedule and execute configured DCA
// app.post("/dca", async (c) => {

// Get current config settings, eventually to edit in UI
// app.get("/dca", async (c) => {
// return c.text(JSON.stringify("DCA route"));
// });

app.post("/order", zValidator("json", OrderParser), async (c) => {
	const json = c.req.valid("json");

	try {
		const res = await buyStock(c, json);

		if (!res.ok) {
			throw { status: res.status };
		}

		return c.json({
			success: true,
			status: 200,
			message: `Order placed successfully - ${json.symbol} for $${json.notional}`,
		});
	} catch (error) {
		return c.json({
			success: false,
			status: error?.status ?? 500,
			message: "An error occurred while trying to place the order",
		});
	}
});

app.post("/order/dca", async (c) => {
	const stocksArray = JSON.parse(await c.env.DB_ALPACA_DCA.get("STOCKS")) || [];

	const dcaStocks = getStocksForToday(stocksArray);

	const executionPromises = dcaStocks.map(
		async (stock) =>
			await buyStock(c, {
				symbol: stock.symbol,
				notional: stock.notional,
				side: "buy",
				type: "market",
				time_in_force: "day",
			}),
	);

	try {
		const res = await Promise.allSettled(executionPromises);
		// TODO: Sort out count rejected and resolved
		// Resolve all value fields before returning response
		// How to force rejected outcome

		console.log("Succeed - DCA", res);
		
		return c.json({
			response: res,
		});
	} catch (error) {
		console.error("Error - DCA", error);
		
		return c.json({
			success: false,
			status: error?.status ?? 500,
			message: "An error occurred while trying to execute the DCA orders",
		});
	}
});

app.get("/stocks", async (c) => {
	try {
		const stocksArray =
			JSON.parse(await c.env.DB_ALPACA_DCA.get("STOCKS")) || [];

		return c.json(stocksArray);
	} catch (err) {
		return c.text("An error occurred", 500);
	}
});

app.post("/stocks", zValidator("json", StockConfigParser), async (c) => {
	// TODO: Should check if symbol exists at all
	// In case of GUI - Should check there also

	try {
		const stocksArray =
			JSON.parse(await c.env.DB_ALPACA_DCA.get("STOCKS")) || [];

		const json = c.req.valid("json");

		const doesExist = doesStockExist(stocksArray, json);

		if (doesExist) {
			// TODO: Deep compare to check whether to update or not
			// Currently, it just updates the stock if it exists
			// const didChange = ....

			const newStocksArray = stocksArray.map((stock) => {
				if (stock.symbol === json.symbol) {
					return json;
				}

				return stock;
			});

			await c.env.DB_ALPACA_DCA.put("STOCKS", JSON.stringify(newStocksArray));

			return c.json({
				success: true,
				message: "Stock already exists - Edited instead",
				data: newStocksArray,
			});
		}

		const newStocksArray = [...stocksArray, json];

		await c.env.DB_ALPACA_DCA.put("STOCKS", JSON.stringify(newStocksArray));

		return c.json({
			success: true,
			data: newStocksArray,
			message: "Stock added successfully",
		});
	} catch (err) {
		return c.json({
			success: false,
			message: "An error occurred",
			err,
		});
	}
});

export default app;
