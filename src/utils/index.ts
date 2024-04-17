import type { StockConfig, Weekday } from "../schemas/objects";

const dayNames: Weekday[] = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

export const doesStockExist = (current: StockConfig[], entry: StockConfig) => {
	return current.findIndex((stock) => stock.symbol === entry.symbol) !== -1;
};

export const getStocksForToday = (stocksArray: StockConfig[]) => {
	const today = new Date();
	const day = dayNames[today.getDay()];

	return stocksArray.filter((stock) => stock.schedule.includes(day));
};
