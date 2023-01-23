const { Spot } = require('@binance/connector');
const client = new Spot('', '');
const instance = require("./instance");
const setData = require("./data");
class Arbitrage {
	#wsRef;
	#socket;
	constructor(_wl, socket) {
		this.#socket = socket;
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
					.filter(symbol => symbol.q > 800000);

				const tasks = Fields_USDT.map(async stable => {
					const symbol = stable.s.replace('USDT', '');
					const target = Fields_BTC.find(x => x.s === `${symbol}BTC`);
					if (!target)
						return null;
					const filter = _wl.find(x => x.symbol === stable.s)
					const r_filter = _wl.find(x => x.symbol === target.s)
					
					await this.#calcurate({ base, stable, target, filter,r_filter });
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
	
	#calculateReverseProfit(quantity, stablePrice, targetPrice, basePrice, lotsize) {
		const r_quantity = this.#lot(quantity, 0.00001);
		const r_invest = this.#lot(r_quantity * stablePrice, 0.0001);
		const r_target_quantity = this.#lot(r_quantity / targetPrice, lotsize);
		const r_profit = this.#lot(r_target_quantity * basePrice, 0.0001);
		const r_result = this.#lot(r_profit / r_invest * 100, 0.0001)
		return { r_quantity, r_target_quantity, r_invest, r_profit, r_result }
	}
	#Compare({ base, stable, target, filter,r_filter }) {
		
		const { quantity, target_quantity, invest, profit, result } = this.#calculateProfit(11.0 / stable.a, stable.a, target.b, base.b, filter.lotsize)
		const { r_quantity, r_target_quantity, r_invest, r_profit, r_result } = this.#calculateReverseProfit(11.0 / base.a, base.a, target.a, stable.b, r_filter.lotsize)
		const compare = result >= r_result ? result : r_result;
		const compare_invest = result >= r_result ? invest : r_invest;
		const compare_profit = result >= r_result ? profit : r_profit;
		const compare_symbol = result >= r_result ? ['USDT', stable.s, target.s, base.s] : ['USDT', base.s, target.s, stable.s];
		const compare_quantity = result >= r_result ? [0, quantity, quantity, target_quantity] : [0, r_quantity, r_target_quantity, r_target_quantity];
		const compare_price = result >= r_result ? [0, stable.a, target.b, base.b] : [0, base.a, target.a, stable.b];
		const compare_signal = result >= r_result ? ["none", "BUY", "SELL", "SELL"] :["none", "BUY", "BUY", "SELL"]
		const compare_pattern = result >= r_result ? 'A' : 'B';
		return { compare, compare_invest, compare_profit, compare_symbol, compare_quantity, compare_price, compare_signal, compare_pattern }
	}
	async #calcurate({ base, stable, target, filter ,r_filter}) {
		const date = new Date();
		const updatetime = date.toLocaleTimeString();
		const { compare, compare_invest, compare_profit, compare_symbol, compare_quantity, compare_price, compare_signal, compare_pattern } = this.#Compare({ base, stable, target, filter,r_filter });
		const FoundData = setData.arbitrage.find(x => x.symbol === target.s.replace('BTC', ''))
		if (FoundData) {
			FoundData.compare_invest = compare_invest;
			FoundData.compare_profit = compare_profit;
			FoundData.compare = compare;
			FoundData.compare_pattern = compare_pattern;
			FoundData.updatetime = updatetime;
		} else
			setData.arbitrage.push({
				symbol: target.s.replace('BTC', ''),
				compare_invest,
				compare_profit,
				compare,
				compare_pattern,
				updatetime
			});

		if (compare >= 100.15) {
			this.#log(`Found arbitrage ${compare} % symbol ${target.s.replace('BTC', '')} Pattern ${compare_pattern}`)
			if (instance) {
				const tasks = instance.worker.map(async user => {
					const data = [
						{
							symbol: 'USDT',
							invest: compare_invest,
							profit: compare_profit,
							result: compare,
							pattern: compare_pattern
						}, {
							symbol: compare_symbol[1],
							quantity: compare_quantity[1],
							price: compare_price[1],
							signal: compare_signal[1]
						}, {
							symbol: compare_symbol[2],
							quantity: compare_quantity[2],
							price: compare_price[2],
							signal: compare_signal[2]
						}, {
							symbol: compare_symbol[3],
							quantity: compare_quantity[3],
							price: compare_price[3],
							signal: compare_signal[3]
						}];
					await user.arbitrage({ data });
				});
				await Promise.all(tasks);
			}
		}
		else if (compare > 100)
			console.log(`Found arbitrage ${compare} % Lower Setting symbol ${target.s.replace('BTC', '')} Pattern ${compare_pattern}`)
		return
	}
	#log(msg) {
		var d = new Date();
		var n = d.toLocaleTimeString();
		let message = `${n} user:[SYSTEM]  message:[${msg}]`;
		console.log(message)
		//this.#socket.boardcast(message);
	}
	#lot(price, size) {
		const decimalSize = size.toString().split('.')[1]?.length || 0;
		return Number(Math.floor(price / size) * size).toFixed(decimalSize);
	}

	disconnect() {
		client.unsubscribe(this.#wsRef);
	}
}

module.exports = Arbitrage;