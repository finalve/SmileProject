const { Spot } = require('@binance/connector');
const client = new Spot('', '');
const instance = require("../dbs/instance.db");
class SOCKET {
	#wsRef;
	constructor(_wl) {
		this.#wsRef = client.tickerWS('', {
			open: () => console.debug('Connected with Websocket server'),
			close: () => console.debug('Disconnected with Websocket server'),
			message: async data => {
				const symbols = JSON.parse(data);
				const base = symbols.find(x => x.s === 'BTCUSDT');
				const filteredFields = symbols
					.filter(symbol => _wl.find(x => x.symbol === symbol.s));
				const Fields_BTC = filteredFields
					.filter(symbol => symbol.s.includes('BTC'));
				const Fields_USDT = filteredFields
					.filter(symbol => symbol.s.includes('USDT'))
					.filter(symbol => symbol.q > 3000000);

				const tasks = Fields_USDT.map(async stable => {
					const symbol = stable.s.replace('USDT', '');
					const target = Fields_BTC.find(x => x.s === `${symbol}BTC`);
					const filter = _wl.find(x => x.symbol === stable.s)

					if (!target)
						return;

					await this.#calcurate({ base, stable, target, filter });
				});
				await Promise.all(tasks);
			}
		})
	}
	#calculateProfit(quantity, stablePrice, targetPrice, basePrice, lotsize) {
		quantity = this.#lot(quantity, lotsize);
		const invest = this.#lot(quantity * stablePrice, 0.0001);
		const target_quantity = this.#lot(quantity * targetPrice, 0.00001);
		const profit = this.#lot(target_quantity * basePrice, 0.0001);
		const result = this.#lot(profit / invest * 100, 0.0001)
		return { quantity, target_quantity, invest, profit, result }
	}

	async #calcurate({ base, stable, target, filter }) {
		const { quantity, target_quantity, invest, profit, result } = this.#calculateProfit(11.0 / stable.a, stable.a, target.b, base.b, filter.lotsize)

		if (result > 100.15) {
			if (instance) {
				const tasks = instance.users.map(async user => {
					const data = [
						{
							symbol: 'USDT',
							quantity: invest,
							result: result
						}, {
							symbol: stable.s,
							quantity: quantity,
							price: stable.a
						}, {
							symbol: target.s,
							quantity: quantity,
							price: target.a
						}, {
							symbol: base.s,
							quantity: target_quantity,
							price: base.a
						}];
					await user.arbitrage({ data });
				});
				await Promise.all(tasks);
			}
		}else if (result > 100)
		{
			this.#log(`Found persen ${result} % less 100.15`)
		}
	}
	#log(msg) {
		var d = new Date();
		var n = d.toLocaleTimeString();
		console.log(`${n} user:[SYSTEM]  message:[${msg}]`)
	}
	#lot(price, size) {
		const decimalSize = size.toString().split('.')[1]?.length || 0;
		return Number(Math.floor(price / size) * size).toFixed(decimalSize);
	}

	disconnect() {
		client.unsubscribe(this.#wsRef);
	}
}

module.exports = SOCKET;