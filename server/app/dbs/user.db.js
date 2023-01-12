const { Spot } = require('@binance/connector');

class USERS {
	#client;
	#pwd;
	#wsRef;
	#openOrder = [];
	constructor({ label, pwd, key, serect }) {
		this.label = label;
		this.key = key;
		this.#pwd = pwd;
		this.#client = new Spot(key, serect);
		this.#report();
	}

	async arbitrage({ data }) {
		const response = await this.#newOrder(data[1].symbol, 'BUY', data[1].quantity, data[1].price)
		this.#openOrder.push({ data: data, response: response.data });
		if (this.#openOrder.length < 1) {
		}
	}

	async #report() {
		const _this = this;
		const ListenKey = await this.#createListenKey();
		this.#wsRef = this.#client.userData(ListenKey.listenKey, {
			open: () => this.#log(`Connected to Socket Report`),
			close: () => this.#log(`Disconnected with Socket Report`),
			message: async data => {
				// x = [NEW,CANCELED,PARTIALLY_FILLED,FILLED]
				// e = [executionReport,outboundAccountPosition]
				const response = JSON.parse(data)
				let json = {};
				if (response.e == "executionReport") {
					json = {
						report: response.e,
						symbol: response.s,
						order: response.o,
						signal: response.S,
						price: response.p,
						currentOrder: response.X,
						orderId: response.i
					};

					switch (json.currentOrder) {
						case "NEW":
							this.#log(`Created Order ${json.orderId} Symbol ${json.symbol}`);
							break;
						case "CANCELED":
							this.#openOrder = this.#openOrder.filter(x => x.response.orderId !== json.orderId);
							this.#log(`Canceled Order ${json.orderId} Symbol ${json.symbol}`);
							break;
						case "FILLED":
							this.#log(`Filled Order ${json.orderId} Symbol ${json.symbol}`);
							const order = this.#openOrder.find(x => x.response.orderId == json.orderId);
							if (order) {
								if (order.response.symbol == 'BTCUSDT') {
									this.#openOrder = this.#openOrder.filter(x => x.response.orderId !== json.orderId);
									this.#log(`Arbitrage Success Symbol [${order.data[1].symbol} ${order.data[2].symbol} ${order.data[3].symbol}]`);
								}
								else if (order.response.symbol.includes('USDT')) {
									const response = await this.#newOrder(order.data[2].symbol, 'SELL', order.data[2].quantity, order.data[2].price)
									order.response = response.data
								} else if (order.response.symbol.includes('BTC')) {
									const response = await this.#newOrder(order.data[3].symbol, 'SELL', order.data[3].quantity, order.data[3].price)
									order.response = response.data;
								}
							}
							break;
						default:
							this.#log(`${json.currentOrder} Order ${json.orderId} Symbol ${json.symbol}`);
					}
				} else {
					json = {
						report: response.e,
						symbol: response.B
					};

				}
			}
		});
		setTimeout(() => _this.#refresh(), 3600000)
	}
	#refresh(){
		this.#disconnect();
		this.#log(`Restart Socket`);
		this.#report();
	}
	#log(msg) {
		var d = new Date();
		var n = d.toLocaleTimeString();
		console.log(`${n} user:[${this.label}]  message:[${msg}]`)
	}
	async #newOrder(symbol, process, quantity, price) {
		try {
			const response = await this.#client.newOrder(symbol, process, 'LIMIT',
				{
					quantity: quantity,
					price: price,
					timeInForce: 'GTC'
				});
			return response;
		} catch (error) {
			return error.response;
		}
	}
	async #createListenKey() {
		const response = await this.#client.createListenKey()
		return response.data;
	}

	async #cancelOrder(symbol, orderId) {
		try {
			const response = await this.#client.cancelOrder(symbol, { orderId: _orderId });
			return response;
		} catch (error) {
			return error.response;
		}
	}
	#disconnect() {
		this.#client.unsubscribe(this.#wsRef);
	}
	delete({ pwd }) {
		if (pwd === this.#pwd) {
			this.#disconnect();
			return true
		}

		return false
	}
}

module.exports = USERS;