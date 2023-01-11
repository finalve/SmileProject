const { Spot } = require('@binance/connector');

class USERS {
	#client;
	#pwd
	constructor({ label, pwd, key, serect }) {
		this.label = label;
		this.key = key;
		this.#pwd = pwd;
		this.#client = new Spot(key, serect);
	}

	async arbitrage({ data}) {

		const response = await this.#newOrder(data[1].symbol, 'BUY', data[1].quantity, data[1].price)
		console.log(response);
	}
	async #newOrder(symbol, process, quantity, price) {
		try {
			const response = await this.#client.newOrder(symbol, process,'LIMIT',
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