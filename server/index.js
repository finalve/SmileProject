const express = require("express");
const app = express();
app.use(express.json());

const controllers = require("./app/controllers");
const { api, socket, data } = controllers;
require("./app/routes/user.route")(app);

const exchangeInfo = async () => {
	const info = await api.exchangeInfo();
	info.forEach(element => {
		if (!data.whitelist.find(x => x === element.symbol))
		{
			data.whitelist.push({
				symbol:element.symbol,
				lotsize:element.filters.find(x=>x.filterType === 'LOT_SIZE').stepSize,
				pricefilter:element.filters.find(x=>x.filterType === 'PRICE_FILTER').tickSize
			});
		}
	});
	//console.log(data.whitelist)
}

exchangeInfo().then(()=>new socket(data.whitelist));
