const { Spot } = require('@binance/connector');
var { whitelist,arbitrage } = require('./models/vDB');
var Bridge = require('./controllers/bridge');
const Arbitrage = require('./controllers/arbitrage');
const config = require('./config');
const client = new Spot();
const getExchangeInfo = async () => {
    try {
        const response = await client.exchangeInfo();
        const filteredFields = response.data.symbols
            .filter(symbol => symbol.quoteAsset === 'BTC' || symbol.quoteAsset === 'USDT')
            .filter(symbol => symbol.status !== 'BREAK');

        return filteredFields;
    } catch (error) {
        console.error(error?.response?.data);
    }
}

const exchangeInfo = async () => {
	const info = await getExchangeInfo();
	const btcusdt = info.find(x=>x.symbol === 'BTCUSDT');
	info.forEach(element => {
		const Asset = whitelist.find(x => x.baseAsset === element.baseAsset);
		if (!Asset) {
			if (element.quoteAsset === 'BUSD') {
				whitelist.push({
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
				whitelist.push({
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
				whitelist.push({
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
	whitelist = whitelist.filter(x => x.usdt && x.btc && x.btcusdt)
}
new Bridge();
exchangeInfo().then(() => new Arbitrage(whitelist,config.servername));