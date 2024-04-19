import { z } from "zod";

const WeekdayParser = z.enum([
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
]);

export const StockConfigParser = z.object({
	symbol: z.string(),
	notional: z.union([z.string(), z.number()]),
	enabled: z.boolean().default(true),
	schedule: z.array(WeekdayParser),
	// schedule: z.string(),
	// .regex(
	// 	/^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})|(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)$/,
	// )
	// .optional()
	// .describe("NON FUNCTIONAL - Cronjob format - For individual stock DCA"),
});

// Currently only supporting notional
export const OrderParser = z.object({
	symbol: z.string(),
	// qty: z.string().optional(),
	notional: z.union([z.string(), z.number()]),
	side: z.enum(["buy", "sell"]).default("buy"),
	type: z
		.enum(["market", "limit", "stop", "stop_limit", "trailing_stop"])
		.default("market"),
	time_in_force: z.enum(["day", "gtc", "opg", "ioc", "fok"]).default("day"),
});

export type Weekday = z.infer<typeof WeekdayParser>;

export type StockConfig = z.infer<typeof StockConfigParser>;

export type Order = z.infer<typeof OrderParser>;
