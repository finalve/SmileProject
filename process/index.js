const express = require("express");
const cors = require('cors')
const jwt = require('jsonwebtoken');
const { arbitrage, api, data } = require("./controllers");
const socket = require("./websocket/socket");
const config = require('./config');
const app = express();
const port = 6060;

app.use(express.json());
app.use(cors());

const server = app.listen(port, () => console.log(`app listening on port ${port}!`));

const exchangeInfo = async () => {
	const info = await api.exchangeInfo();
	const btcusdt = info.find(x=>x.symbol === 'BTCUSDT');
	info.forEach(element => {
		const Asset = data.whitelist.find(x => x.baseAsset === element.baseAsset);
		if (!Asset) {
			if (element.quoteAsset === 'BUSD') {
				data.whitelist.push({
					baseAsset: element.baseAsset,
					busd: {
						symbol: element.symbol,
						quoteAsset: element.quoteAsset,
						lotsize: element.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
						pricefilter: element.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
					}
				});
			}
			if (element.quoteAsset === 'USDT') {
				data.whitelist.push({
					baseAsset: element.baseAsset,
					usdt: {
						symbol: element.symbol,
						quoteAsset: element.quoteAsset,
						lotsize: element.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
						pricefilter: element.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
					}
				});
			}
			if (element.quoteAsset === 'BTC') {
				data.whitelist.push({
					baseAsset: element.baseAsset,
					btc: {
						symbol: element.symbol,
						quoteAsset: element.quoteAsset,
						lotsize: element.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
						pricefilter: element.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
					}
				});
			}
		}
		else {
			if (element.quoteAsset === 'BUSD') {
				Asset.busd = {
					symbol: element.symbol,
					quoteAsset: element.quoteAsset,
					lotsize: element.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
					pricefilter: element.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
				}
			}
			if (element.quoteAsset === 'USDT') {
				Asset.usdt = {
					symbol: element.symbol,
					quoteAsset: element.quoteAsset,
					lotsize: element.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
					pricefilter: element.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
				}
			}
			if (element.quoteAsset === 'BTC') {
				Asset.btc = {
					symbol: element.symbol,
					quoteAsset: element.quoteAsset,
					lotsize: element.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
					pricefilter: element.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
				}
			}
			Asset.btcusdt = {
				symbol: btcusdt.symbol,
				quoteAsset: btcusdt.quoteAsset,
				lotsize: btcusdt.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
				pricefilter: btcusdt.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
			}
		}
	
	});
	data.whitelist = data.whitelist.filter(x => x.usdt && x.btc && x.btcusdt)
}

exchangeInfo().then(() => new arbitrage(data.whitelist, new socket()));