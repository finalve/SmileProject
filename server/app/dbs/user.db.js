const { Spot } = require('@binance/connector');

class USERS {
	#client;
	#pwd;
	#wsRef;
	constructor({ label, pwd, key, serect }) {
		this.label = label;
		this.key = key;
		this.#pwd = pwd;
		this.#client = new Spot(key, serect);
		this.#report();
	}

	async arbitrage({ data }) {
		//const response = await this.#newOrder(data[1].symbol, 'BUY', data[1].quantity, data[1].price)
		//response = await this.#newOrder(data[2].symbol, 'SELL', data[2].quantity, data[2].price)
		//response = await this.#newOrder(data[3].symbol, 'SELL', data[2].quantity, data[3].price)
		//console.log(response.data);
	}

	async #report() {
		const ListenKey = await this.#createListenKey();
		this.#wsRef = this.#client.userData(ListenKey.listenKey, {
			open: () => console.debug(`Connected to Socket Report ${this.label}`),
			close: () => console.debug(`Disconnected with Socket Report ${this.label}`),
			message: data => { console.log(JSON.parse(data)) }
		});
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

	delete({ pwd }) {
		if (pwd === this.#pwd)
			return true
		return false
	}
}

module.exports = USERS;