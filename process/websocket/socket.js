const socket = require("socket.io-client");
const Worker = require('../controllers/worker');
const Instance = require('../controllers/instance');
const config = require('../config');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const BASE = '103.252.119.56';
const API_URL = `http://${BASE}/api/`;
class Socket {
	#socket;
	#ipaddress;
	constructor() {
		this.#getipaddress().then((response) => {
			this.#ipaddress = response.data.ip;
		});
		const token = jwt.sign({ user: 'server-1' }, config.serect);
		//this.#socket = socket.connect('http://localhost:8080', { path :'/socket', query: { token } });
		this.#socket = socket.connect(`http://${BASE}/`, { path: '/socket', query: { token } });
		this.#socket.on('authenticated', (res) => {
			console.log(res);
		});
		this.#socket.on('ipaddress', (req) => {
			this.#socket.emit('ipaddress', { ip: this.#ipaddress });
		})
		this.#socket.on('add', (req) => {
			if (Instance.worker.find((worker) => worker.apikey === req.apikey)) {
				this.#socket.emit('add', {
					status: 400,
					id: req._id,
					message: `KEY or Label already exists!`
				});
				this.#log(`Worker ${req.label} IP::[${req._ip}] already exists!`);
				return 
			}
			if (isNaN(req.invest)) {
				this.#socket.emit('add', {
					status: 400,
					id: req._id,
					message: `invalid invest`
				});
				this.#log(`Worker ${req.label} IP::[${req._ip}] invalid invest!`);
				return 
			}

			const newWorker = new Worker(req);
			Instance.worker.push(newWorker);
			this.#socket.emit('add', {
				status: 200,
				id: req._id,
				message: `${req.label} connect to server!`
			})
			this.#log(`Worker ${req.label} IP::[${req._ip}] connect to server!`);
			return

		});

		this.#socket.on(('delete'), (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
			if (!foundWorker) {
				this.#socket.emit('delete', {
					status: 400,
					id: req._id,
					message: `User not found`
				});
				this.#log(`IP::[${req._ip}] User not found`);
				return 
			}

			foundWorker.delete();
			Instance.worker = Instance.worker.filter((worker) => worker.label !== req.label);
			this.#socket.emit('delete', {
				status: 200,
				id: req._id,
				message: `Worker ${req.label} deleted successfully!`
			});
			this.#log(`Worker ${req.label} IP::[${req._ip}] deleted successfully! ${Instance.worker.length}`);
			return 
		});

		this.#socket.on(('rmorder'), (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
			if (!foundWorker) {
				this.#socket.emit('rmorder', {
					status: 400,
					id: req._id,
					message: `User not found`
				});
				this.#log(`IP::[${req._ip}] User not found`);
				return 
			}

			foundWorker.removeOrder(req.orderId);
			this.#socket.emit('rmorder', {
				status: 200,
				id: req._id,
				message: `Worker ${req.label} Remove Order ${req.orderId} successfully!`
			});
			this.#log(`Worker ${req.label} Remove Order ${req.orderId} successfully! ${Instance.worker.length}`);
			return 
		});

		this.#socket.on(('edit'), (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
			if (!foundWorker) {
				this.#socket.emit('edit', {
					status: 400,
					id: req._id,
					message: `User not found`
				});
				this.#log(`IP::[${req._ip}] User not found`);
				return 
			}

			foundWorker.ipr = req.ipr;
			foundWorker.orderLength = req?.opl;
			this.#socket.emit('edit', {
				status: 200,
				id: req._id,
				message: `Worker ${req.label} edit successfully!`,
				data: foundWorker
			});
			this.#log(`Worker ${req.label} IP::[${req._ip}] edit successfully! ${Instance.worker.length}`);
			return
		});

		this.#socket.on(('admindelete'), (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.userlabel);
			if (!foundWorker) {
				this.#socket.emit('delete', {
					status: 400,
					id: req._id,
					message: `User not found`
				});
				this.#log(`IP::[${req._ip}] User not found`);
				return 
			}

			foundWorker.delete();
			Instance.worker = Instance.worker.filter((worker) => worker.label !== req.userlabel);
			this.#socket.emit('delete', {
				status: 200,
				id: req._id,
				message: `Worker ${req.userlabel} deleted successfully!`
			});
			 this.#log(`Worker ${req.userlabel} IP::[${req._ip}] deleted successfully! ${Instance.worker.length}`);
			 return
		});

		this.#socket.on(('adminrmorder'), (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.userlabel);
			if (!foundWorker) {
				this.#socket.emit('rmorder', {
					status: 400,
					id: req._id,
					message: `User not found`
				});
				this.#log(`IP::[${req._ip}] User not found`);
				 return
			}

			foundWorker.removeOrder(req.orderId);
			this.#socket.emit('rmorder', {
				status: 200,
				id: req._id,
				message: `Worker ${req.userlabel} Remove Order ${req.orderId} successfully!`
			});
		 this.#log(`Worker ${req.userlabel} IP::[${req._ip}] Remove Order ${req.orderId} successfully! ${Instance.worker.length}`);
		 return
		});


		this.#socket.on(('adminedit'), (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.userlabel);
			if (!foundWorker) {
				this.#socket.emit('edit', {
					status: 400,
					id: req._id,
					message: `User not found`
				});
				this.#log(`IP::[${req._ip}] User not found`);
				return
			}

			foundWorker.ipr = req.ipr;
			foundWorker.orderLength = req?.opl;
			this.#socket.emit('edit', {
				status: 200,
				id: req._id,
				message: `Worker ${req.userlabel} edit successfully!`,
				data: foundWorker
			});
			this.#log(`Worker ${req.userlabel} IP::[${req._ip}] edit successfully! ${Instance.worker.length}`);
			return
		});

		this.#socket.on('userdata', (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
			if (!foundWorker)
				return this.#socket.emit('userdata', {
					status: 400,
					id: req._id,
					message: `User not found`
				});

			return this.#socket.emit('userdata', {
				status: 200,
				id: req._id,
				data: {
					label: foundWorker.label,
					status: foundWorker.status(),
					error: foundWorker.errorMessage,
					maxlen: foundWorker.orderLength,
					len: foundWorker.openOrder.length,
					invesment: foundWorker.Invesment,
					ipr: foundWorker.ipr,
					alive: foundWorker.alive,
					pnl: parseFloat(foundWorker.pnl).toFixed(8),
					btc: parseFloat(foundWorker.btc).toFixed(8),
					bnb: parseFloat(foundWorker.BNB).toFixed(8),
					takeOrder: foundWorker.takeOrder,
					success: foundWorker.success,
					orderOpen: foundWorker.openOrder

				}
			});
		})

		this.#socket.on('alluser', (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
			if (!foundWorker)
				return this.#socket.emit('userdata', {
					status: 400,
					id: req._id,
					message: `User not found`
				});

			return this.#socket.emit('alluser', {
				status: 200,
				id: req._id,
				data: Instance.worker
			});
		})
	}
	#getipaddress() {
		return axios.get(API_URL + 'getipaddress');
	}
	#log(msg) {
		var d = new Date();
		var n = d.toLocaleTimeString();
		let message = `${n} user:[SYSTEM]  message:[${msg}]`;
		console.log(message)
	}
}
module.exports = Socket;