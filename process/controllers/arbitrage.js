const { Spot } = require('@binance/connector');
const client = new Spot('', '');
const instance = require("./instance");
const setData = require("./data");
class Arbitrage {
	#wsRef;
	#r_wsRef;
	#socket;
	constructor(eInfo, socket) {
		this.#socket = socket;
		this.#wsRef = client.tickerWS('', {
			open: () => console.debug('Connected with Websocket server'),
			close: () => console.debug('Disconnected with Websocket server'),
			message: async data => {
				let symbols = JSON.parse(data);
				const tasks = eInfo.map(async asset => {
					const _array = symbols.filter(x => x.s === `${asset.btcusdt.symbol}` || (x.s === `${asset.btc.symbol}` || (x.s === `${asset.usdt.symbol}` && x.q > 1000000)));
					if (_array.length < 3)
						return null
					const filter = asset.usdt;
					let stable = '';
					let target = '';
					let base = '';
					for (let value of _array) {
						switch (value.s) {
							case 'BTCUSDT':
								base = value;
								break;
							case `${asset.baseAsset}BTC`:
								target = value;
								break;
							case `${asset.baseAsset}USDT`:
								stable = value;
								break;
						}
					}
					this.#calcurate({ base, stable, target, filter });
				})
			}
		})

		this.#r_wsRef = client.tickerWS('', {
			open: () => console.debug('Connected with Websocket server'),
			close: () => console.debug('Disconnected with Websocket server'),
			message: async data => {
				let symbols = JSON.parse(data);
				const tasks = eInfo.map(async asset => {
					const _array = symbols.filter(x => x.s === `${asset.btcusdt.symbol}` || (x.s === `${asset.btc.symbol}` || (x.s === `${asset.usdt.symbol}` && x.q > 1000000)));
					if (_array.length < 3)
						return null
					const filter = asset.btc;
					let stable = '';
					let target = '';
					let base = '';
					for (let value of _array) {
						switch (value.s) {
							case 'BTCUSDT':
								base = value;
								break;
							case `${asset.baseAsset}BTC`:
								target = value;
								break;
							case `${asset.baseAsset}USDT`:
								stable = value;
								break;
						}
					}
					this.#r_calcurate({ base, stable, target, filter });
				})
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
	#Compare({ base, stable, target, filter }) {

		const { quantity, target_quantity, invest, profit, result } = this.#calculateProfit(11.0 / stable.a, stable.a, target.b, base.b, filter.lotsize)
		const compare = result;
		const compare_invest = invest;
		const compare_profit = profit;
		const compare_symbol = ['USDT', stable.s, target.s, base.s];
		const compare_quantity = [0, quantity, quantity, target_quantity];
		const compare_price = [0, stable.a, target.b, base.b];
		const compare_signal = ["none", "BUY", "SELL", "SELL"];
		const compare_pattern = 'A';
		return { compare, compare_invest, compare_profit, compare_symbol, compare_quantity, compare_price, compare_signal, compare_pattern }
	}

	#r_Compare({ base, stable, target, filter }) {
		const { r_quantity, r_target_quantity, r_invest, r_profit, r_result } = this.#calculateReverseProfit(11.0 / base.a, base.a, target.a, stable.b, filter.lotsize)
		const compare = r_result;
		const compare_invest = r_invest;
		const compare_profit = r_profit;
		const compare_symbol = ['USDT', base.s, target.s, stable.s];
		const compare_quantity = [0, r_quantity, r_target_quantity, r_target_quantity];
		const compare_price = [0, base.a, target.a, stable.b];
		const compare_signal = ["none", "BUY", "BUY", "SELL"]
		const compare_pattern = 'B';
		return { compare, compare_invest, compare_profit, compare_symbol, compare_quantity, compare_price, compare_signal, compare_pattern }
	}
	async #calcurate({ base, stable, target, filter }) {
		const { compare, compare_invest, compare_profit, compare_symbol, compare_quantity, compare_price, compare_signal, compare_pattern } = this.#Compare({ base, stable, target, filter });
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
				this.#getworker({ target ,compare, compare_invest, compare_profit,compare_pattern });
				await Promise.all(tasks);
			}
		}
		else if (compare > 100)
		{
			//console.log(`Found arbitrage ${compare} % Lower Setting symbol ${target.s.replace('BTC', '')} Pattern ${compare_pattern}`)
			
		}
	}

	async #r_calcurate({ base, stable, target, filter }) {
		const { compare, compare_invest, compare_profit, compare_symbol, compare_quantity, compare_price, compare_signal, compare_pattern } = this.#r_Compare({ base, stable, target, filter });
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
				this.#getworker({ target ,compare, compare_invest, compare_profit,compare_pattern });
				await Promise.all(tasks);
			}
		}
		if (compare > 100)
		{
			//console.log(`Found arbitrage ${compare} % Lower Setting symbol ${target.s.replace('BTC', '')} Pattern ${compare_pattern}`)
			
		}
	}

	#getworker({ target ,compare, compare_invest, compare_profit,compare_pattern }) {
		const date = new Date();
		const updatetime = date.toLocaleTimeString();
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