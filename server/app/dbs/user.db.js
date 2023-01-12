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
		//const response = await this.#newOrder(data[1].symbol, 'BUY', data[1].quantity, data[1].price)
		if (this.#openOrder.length < 1) {
			const response = await this.#newOrder('BTCUSDT', 'BUY', 0.0009, '15000')
			response.data.step = 1;
			this.#openOrder.push({ data: data, response: response.data });
		}

		//response = await this.#newOrder(data[2].symbol, 'SELL', data[2].quantity, data[2].price)
		//response = await this.#newOrder(data[3].symbol, 'SELL', data[2].quantity, data[3].price)
		//console.log(response.data);
	}

	async #report() {
		const ListenKey = await this.#createListenKey();
		this.#wsRef = this.#client.userData(ListenKey.listenKey, {
			open: () => console.debug(`Connected to Socket Report ${this.label}`),
			close: () => console.debug(`Disconnected with Socket Report ${this.label}`),
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
					const order = this.#openOrder.find(x => x.response.orderId == json.orderId);
					if (order) {
						switch(json.currentOrder) {
							case "NEW":
								this.#log(`Created Order ${json.orderId} Symbol ${json.symbol}`);
							  break;
							case "CANCELED":
								this.#openOrder = this.#openOrder.filter(x => x.response.orderId !== json.orderId);
								this.#log(`Canceled Order ${json.orderId} Symbol ${json.symbol}  Length ${this.#openOrder.length}`);
							  break;
							default:
								console.log(order.data);
						  }
						//console.log(order.data);
					}
					// if(json.currentOrder == "PARTIALLY_FILLED")
					// {
					// 	let step = order.step + 1;
					// 	const response = await this.#newOrder(data[step].symbol, 'SELL', data[step].quantity, data[step].price)
					// }
				} else {
					json = {
						report: response.e,
						symbol: response.B
					};

				}
			}
		});
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