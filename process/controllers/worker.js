const { Spot } = require('@binance/connector');
class Worker {
	#client;
	#wsRef;
	#listenkey;
	#started = false;
	constructor({ label,apikey, apiserect }) {
		this.label = label;
		this.apikey = apikey;
		this.Invesment = 0;
		this.orderLength = 5;
		this.openOrder = [];
		this.#client = new Spot(apikey, apiserect);
		this.#myWallet();
		this.#createListenKey();
		this.alive = new Date().getTime();
		this.pnl = 0;
		
	}
	
	async arbitrage({ data }) {
		if (this.#started)
			if (this.Invesment > data[0].invest)
				if (this.openOrder.length < this.orderLength) {
					this.openOrder.push({ data: data, response: { orderId: 0 } });
					const response = await this.#newOrder(data[1].symbol,data[1].signal, data[1].quantity, data[1].price)
					if (!response.data)
						this.#error(response);
				}
	}
	#callback = {
		open: () => {
			this.#log(`Connected to Server`)
			this.#started = true;
		},
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
					quote: response.Z,
					currentOrder: response.X,
					orderId: response.i
				};

				switch (json.currentOrder) {
					case "NEW":
						{
							const order = this.openOrder.find(x => x.data[1].symbol === json.symbol && x.data[1].price === json.price && x.response.orderId === 0);
							if (order) {
								order.response = {
									symbol: json.symbol,
									orderId: json.orderId
								}
							}
							this.#log(`Created Order ${json.orderId} Symbol ${json.symbol} data length ${this.openOrder.length}`);
						}
						break;
					case "CANCELED":
						this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
						this.#log(`Canceled Order ${json.orderId} Symbol ${json.symbol} data length ${this.openOrder.length}`);
						break;
					case "FILLED":
						{
							this.#log(`Filled Order ${json.orderId} Symbol ${json.symbol} data length ${this.openOrder.length}`);
							const order = this.openOrder.find(x => x.response?.orderId == json.orderId);
							if (order) {
								if(order.data[0].pattern === "A")
								{
									if (order.response.symbol === 'BTCUSDT') {
										this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
										this.#log(`Arbitrage Success Symbol [${order.data[1].symbol} ${order.data[2].symbol} ${order.data[3].symbol}] profit ${json.quote / order.data[0].invest * 100 - 100} %`);
										this.pnl += json.quote - order.data[0].invest
									}
									else if (order.response.symbol.includes('USDT')) {
										const response = await this.#newOrder(order.data[2].symbol, `${order.data[2].signal}`, order.data[2].quantity, order.data[2].price)
										if (!response.data)
											this.#error(response);
										order.response = response.data
									} else if (order.response.symbol.includes('BTC')) {
										const response = await this.#newOrder(order.data[3].symbol,   `${order.data[3].signal}`, order.data[3].quantity, order.data[3].price)
										if (!response.data)
											this.#error(response);
										order.response = response.data;
									}
								}else if(order.data[0].pattern === "B")
								{
									if (order.response.symbol.includes('USDT')&&order.response.symbol !== 'BTCUSDT') {
										this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
										this.#log(`Arbitrage Success Symbol [${order.data[1].symbol} ${order.data[2].symbol} ${order.data[3].symbol}] profit ${json.quote / order.data[0].invest * 100 - 100} %`);
										this.pnl += json.quote - order.data[0].invest
									}
									else if (order.response.symbol === 'BTCUSDT') {
										const response = await this.#newOrder(order.data[2].symbol,  `${order.data[2].signal}`, order.data[2].quantity, order.data[2].price)
										if (!response.data)
											this.#error(response);
										order.response = response.data
									} 
									else if (order.response.symbol.includes('BTC')) {
										const response = await this.#newOrder(order.data[3].symbol,  `${order.data[3].signal}`, order.data[3].quantity, order.data[3].price)
										if (!response.data)
											this.#error(response);
										order.response = response.data;
									}
								}
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
				try {
					const stable = json.symbol.find(x => x.a === 'USDT')
					if (!stable.f)
						this.#error(`${stable}`)
					this.Invesment = parseFloat(stable.f)
					this.#log(`balance of ${this.Invesment} USDT`)

				} catch (error) {
					this.#error(`${error.response}`)
				}

			}
		}
	};
	#report() {
		const _this = this;
		const wsRef = this.#client.userData(this.#listenkey, this.#callback);
		this.#disconnect();
		this.#wsRef = wsRef;
		setTimeout(() => _this.#refresh(), 7200000)
	}
	#refresh() {
		this.#createListenKey();
		this.#log(`Restart Socket`);
	}
	#log(msg) {
		var d = new Date();
		var n = d.toLocaleTimeString();
		console.log(`${n} user:[${this.label}] message:[${msg}]`)
	}

	#error(msg) {
		var d = new Date();
		var n = d.toLocaleTimeString();
		//console.log(`${n} user:[${this.label}] error:[${JSON.parse(msg)}]`)
		console.log(msg)
	}
	async #myWallet() {
		try {
			const response = await this.#client.userAsset();
			const stable = response.data.find(x => x.asset === 'USDT');
			this.Invesment = parseFloat(stable.free);
			this.#log(`balance of ${this.Invesment} USDT`)
			return response.data
		} catch (error) {
			this.#error(error.response.data);
		}
	}
	async #newOrder(symbol, signal, quantity, price) {
		try {
			const response = await this.#client.newOrder(symbol, signal, 'LIMIT',
				{
					quantity: quantity,
					price: price,
					timeInForce: 'GTC'
				});
			return response;
		} catch (error) {
			return error;
		}
	}
	async #createListenKey() {
		try {
			const response = await this.#client.createListenKey()
			this.#listenkey = response.data.listenKey;
			this.#report();
			this.status = true;
		} catch (error) {
			console.log(error.response.data)
			this.status = false;
		}
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
	status() {
		return this.#started;
	}
	delete() {
			this.#started = false;
			this.#disconnect();
	}
}

module.exports = Worker;