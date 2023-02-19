const { Spot } = require('@binance/connector');
class Worker {
	#client;
	#wsRef;
	#listenkey;
	#started = false;
	#serect;
	constructor({ label, apikey, apiserect, invest }) {
		this.label = label;
		this.apikey = apikey;
		this.#serect = apiserect;
		this.Invesment = 0;
		this.BNB = 0;
		this.ipr = invest >= 11 ? invest : 11;
		this.takeOrder = 0;
		this.orderLength = 5;
		this.openOrder = [];
		this.#client = new Spot(this.apikey, this.#serect);
		this.#myWallet();
		this.#createListenKey();
		this.alive = new Date().getTime();
		this.pnl = 0;
		this.btc = 0;
		this.history = [];
		this.#loopCheck();
		this.success = [];
		this.errorMessage = 'Wait Connecting to Server';
	}
	async arbitrage({ data }, callback) {
		if (this.#started)
			if (this.Invesment > this.ipr)
				if (this.BNB > 0)
					if (this.openOrder.length < this.orderLength) {
						try {
							const userIPR = callback(this.ipr);
							data.userIPR = userIPR;
							const response = await this.#newOrder(data[1].symbol, 'BUY', userIPR.quantity, data[1].price)
							if (!response.data)
								return
							this.openOrder.push({
								data: data, response:
								{
									symbol: response.data.symbol,
									orderId: response.data.orderId,
									status: response.data.status,
									origQty: response.data.origQty,
									step:1
								}
							});
						} catch (error) {
							console.log(error)
							this.#started = false;
						}

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
					quantity: response.Q,
					execution_type: response.x,
					currentOrder: response.X,
					orderId: response.i
				};
				this.history.push(json)

			} else {
				json = {
					report: response.e,
					symbol: response.B
				};
				try {
					const stable = json.symbol.find(x => x.a === 'USDT')
					const BNB = json.symbol.find(x => x.a === 'BNB')
					if (!stable.f)
						return
					this.Invesment = parseFloat(stable.f)
					this.#log(`balance of ${this.Invesment} USDT`)
					if (!BNB.f)
						return
					this.BNB = parseFloat(BNB.f)
					this.#log(`balance of ${this.BNB} bnb`)

				} catch (error) {
					this.#error(`${error.response}`)
				}

			}
		}
	};
	#loopCheck() {
		const _this = this;
		setTimeout(() => _this.#Nextstep(), 1000);
	}
	#Nextstep() {
		this.history.map(async json => {
			switch (json.currentOrder) {
				case "NEW":
					this.#log(`Created Order ${json.orderId} Symbol ${json.symbol} data length ${this.openOrder.length}`);
					break;
				case "CANCELED":
					this.openOrder = this.openOrder.filter(x => x.response?.orderId !== json.orderId);
					this.#log(`Canceled Order ${json.orderId} Symbol ${json.symbol} data length ${this.openOrder.length}`);
					break;
				case "FILLED":
					{
						this.#log(`Filled Order ${json.orderId} Symbol ${json.symbol} data length ${this.openOrder.length}`);
						const order = this.openOrder.find(x => x.response?.orderId == json.orderId);
						if (order) {
							if (order.data[0].pattern === "A") {
								if (order.response.symbol === 'BTCUSDT') {
									this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
									let lot_btc = order.data.userIPR.true_quantity > 0 ? this.#lot(order.data.userIPR.true_quantity, '0.00000001') : 0;
									let lot_usdt = lot_btc > 0 ? this.#lot(lot_btc * order.data[3].price, '0.000001') : 0;
									let profit_origin = parseFloat(json.quote) + parseFloat(lot_usdt)
									let profit = profit_origin - order.data.userIPR.invest
									this.pnl += profit;
									this.btc += parseFloat(lot_btc);
									this.#log(`Arbitrage Success Symbol [${order.data[1].symbol} ${order.data[2].symbol} ${order.data[3].symbol}] profit ${profit.toFixed(6)} usdt`);
									this.#pushSuccess(`Symbol [${order.data[1].symbol} ${order.data[2].symbol} ${order.data[3].symbol}] profit ${profit.toFixed(6)} usdt`);
									this.takeOrder += 1;
								}
								else if (order.response.symbol.includes('USDT')) {
									try {
										const response = await this.#newOrder(order.data[2].symbol, 'SELL', order.data.userIPR.quantity, order.data[2].price)
										if (!response.data) {
											this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
											return
										}
										order.response = {
											symbol: response.data.symbol,
											orderId: response.data.orderId,
											status: response.data.status,
											origQty: response.data.origQty,
											step:2
										}
									}
									catch (error) {
										this.#started = false;
										this.#error(error);
									}
								} else if (order.response.symbol.includes('BTC')) {
									try {
										const response = await this.#newOrder(order.data[3].symbol, 'SELL', order.data.userIPR.target_quantity, order.data[3].price)
										if (!response.data) {
											this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
											return
										}
										order.response = {
											symbol: response.data.symbol,
											orderId: response.data.orderId,
											status: response.data.status,
											origQty: response.data.origQty,
											step:3
										}
									}
									catch (error) {
										this.#started = false;
										this.#error(error);
									}
								}
							} else if (order.data[0].pattern === "B") {
								if (order.response.symbol.includes('USDT') && order.response.symbol !== 'BTCUSDT') {
									this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
									let lot_btc = order.data.userIPR.true_quantity > 0 ? this.#lot(order.data.userIPR.quantity - order.data.userIPR.true_quantity, '0.00000001') : 0;
									let lot_usdt = lot_btc > 0 ? this.#lot(lot_btc * order.data[1].price, '0.00000001') : 0;
									let profit_origin = parseFloat(json.quote) + parseFloat(lot_usdt)
									let profit = profit_origin - order.data.userIPR.invest
									this.btc += parseFloat(lot_btc);
									this.pnl += profit;

									this.#log(`Arbitrage Success Symbol [${order.data[1].symbol} ${order.data[2].symbol} ${order.data[3].symbol}] profit ${profit.toFixed(6)} usdt`);
									this.#pushSuccess(`Symbol [${order.data[1].symbol} ${order.data[2].symbol} ${order.data[3].symbol}] profit ${profit.toFixed(6)} usdt`);
									this.takeOrder += 1;
								}
								else if (order.response.symbol === 'BTCUSDT') {
									try {
										const response = await this.#newOrder(order.data[2].symbol, 'BUY', order.data.userIPR.target_quantity, order.data[2].price)
										if (!response.data) {
											this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
											return
										}

										order.response = {
											symbol: response.data.symbol,
											orderId: response.data.orderId,
											status: response.data.status,
											origQty: response.data.origQty,
											step:2
										}
									}
									catch (error) {
										this.#started = false;
										this.#error(error);
									}
								}
								else if (order.response.symbol.includes('BTC')) {
									try {
										const response = await this.#newOrder(order.data[3].symbol, 'SELL', order.data.userIPR.target_quantity, order.data[3].price)
										if (!response.data) {
											this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
											return
										}
										order.response = {
											symbol: response.data.symbol,
											orderId: response.data.orderId,
											status: response.data.status,
											origQty: response.data.origQty,
											step:3
										}
									}
									catch (error) {
										this.#started = false;
										this.#error(error);
									}
								}
							}
						}
					}
					break;
				default:
					this.#log(`${json.currentOrder} Order ${json.orderId} Symbol ${json.symbol}`);
			}
			this.history = this.history.filter(x => x !== json);
		})
		this.#loopCheck();
	}

	#lot(price, size) {
		const decimalSize = size.toString().split('.')[1]?.length || 0;
		return Number(Math.floor(price / size) * size).toFixed(decimalSize);
	}
	#pushSuccess(msg) {
		let d = new Date();
		let n = d.toLocaleTimeString();
		let message = `${n} ${msg}`
		if (this.success > 100)
			this.success.shift();
		this.success.push(message);
	}
	#pushSuccess(msg) {
		let d = new Date();
		let n = d.toLocaleTimeString();
		let message = `${n} ${msg}`
		if (this.success > 100)
			this.success.shift();
		this.success.push(message);
	}
	#report() {
		const _this = this;
		this.#wsRef = this.#client.userData(this.#listenkey, this.#callback);
		setTimeout(() => _this.#refresh(), 3600000)
	}
	#refresh() {
		this.#disconnect();
		this.#client = new Spot(this.apikey, this.#serect);
		this.#createListenKey();
		this.#log(`Restart Socket`);
		this.#openOrder().then(oOrder => {
			this.openOrder.map(async (order) => {
				const _ok = oOrder.data.some(x => x.orderId === order.response.orderId);
				if (!_ok)
				{
					const index = order.response.step;
					if(index<3)
					{
						if(order.data[0].pattern === 'A')
						{
							if(index === 1)
							{
								const response = await this.#newOrder(order.data[2].symbol, 'SELL', order.data.userIPR.target_quantity, order.data[2].price)
								order.response = {
									symbol: response.data.symbol,
									orderId: response.data.orderId,
									status: response.data.status,
									origQty: response.data.origQty,
									step:2
								}
							}
							else if(index === 2)
							{
								const response = await this.#newOrder(order.data[3].symbol, 'SELL', order.data.userIPR.target_quantity, order.data[3].price)
								order.response = {
									symbol: response.data.symbol,
									orderId: response.data.orderId,
									status: response.data.status,
									origQty: response.data.origQty,
									step:3
								}
							}
						}
						else if(order.data[0].pattern === 'B')
						{
							if(index === 1)
							{
								const response = await this.#newOrder(order.data[2].symbol, 'SELL', order.data.userIPR.target_quantity, order.data[2].price)
								order.response = {
									symbol: response.data.symbol,
									orderId: response.data.orderId,
									status: response.data.status,
									origQty: response.data.origQty,
									step:2
								}
							}
							else if(index === 2)
							{
								const response = await this.#newOrder(order.data[3].symbol, 'BUY', order.data.userIPR.target_quantity, order.data[3].price)
								order.response = {
									symbol: response.data.symbol,
									orderId: response.data.orderId,
									status: response.data.status,
									origQty: response.data.origQty,
									step:3
								}
							}
						}
						
					}else{
						this.openOrder = this.openOrder.filter(x => x.response.orderId !== res.response.orderId);
					}
					
					
				}
			})
		})
	}
	#log(msg) {
		var d = new Date();
		var n = d.toLocaleTimeString();
		console.log(`${n} user:[${this.label}] message:[${msg}]`)
	}

	#error(msg) {
		var d = new Date();
		var n = d.toLocaleTimeString();
		console.log(
			{
				message: `${n} user:[${this.label}] [ error ]`,
				error: msg
			});
	}
	async #myWallet() {
		try {
			const response = await this.#client.userAsset();
			const stable = response.data.find(x => x.asset === 'USDT');
			const bnb = response.data.find(x => x.asset === 'BNB');
			this.Invesment = parseFloat(stable.free);
			this.BNB = parseFloat(bnb.free);
			this.#log(`balance of ${this.Invesment} USDT`)
			this.#log(`balance of ${this.BNB} BNB`)
			return response.data
		} catch (error) {
			console.log('wallet error')
			this.#started = false;
			this.#error(error.response.data);
			this.errorMessage = error.response.data?.msg;
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
			this.errorMessage = error.response.data?.msg;
			this.#error(error.response.data)
			return error;
		}
	}
	async #createListenKey() {
		try {
			const response = await this.#client.createListenKey()
			this.#listenkey = response.data.listenKey;
			this.#report();
		} catch (error) {
			this.#started = false;
			console.log(error.response.data)
			this.errorMessage = error.response.data?.msg
			return error;
		}
	}

	async #openOrder() {
		try {
			const response = await this.#client.openOrders()
			return response;
		} catch (error) {
			this.#started = false;
			console.log(error.response.data)
			this.errorMessage = error.response.data?.msg
			return error;
		}
	}

	async #cancelOrder(symbol, _orderId) {
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
	removeOrder(orderId) {
		this.openOrder = this.openOrder.filter(x => x.response.orderId != orderId);
		return orderId;
	}
	delete() {
		this.#started = false;
		this.#disconnect();
	}
}

module.exports = Worker;