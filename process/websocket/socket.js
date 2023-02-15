const socket = require("socket.io-client");
const Worker = require('../controllers/worker');
const Instance = require('../controllers/instance');
const config = require('../config')
const jwt = require('jsonwebtoken');
class Socket {
	#socket;
	constructor(){
		const token = jwt.sign({ user: 'server-1' }, config.serect);
		//this.#socket = socket.connect('http://localhost:8080', { path :'/socket', query: { token } });
		this.#socket = socket.connect('http://103.252.119.56/', { path :'/socket', query: { token } });
		this.#socket.on('authenticated', (res) => {
			console.log(res);
		});
		this.#socket.on('add', (req) => {
			if (Instance.worker.find((worker) => worker.apikey === req.apikey)) {
				this.#socket.emit('add',{
					status: 400,
					id:req._id,
					message: `KEY or Label already exists!`
				});
				return this.#log(`Worker ${req.label} already exists!`);
			}

			const newWorker = new Worker(req);
			Instance.worker.push(newWorker);
			this.#socket.emit('add',{
				status: 200,
				id:req._id,
				message: `${req.label} connect to server!`
			})
			return this.#log(`Worker ${req.label} connect to server!`);
		
		});

		this.#socket.on(('delete'), (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
			if (!foundWorker) {
				this.#socket.emit('delete',{
					status: 400,
					id:req._id,
					message: `User not found`
				});
				return this.#log('User not found');
			}

			foundWorker.delete();
			Instance.worker = Instance.worker.filter((worker) => worker.label !== req.label);
			this.#socket.emit('delete',{
				status: 200,
				id:req._id,
				message: `Worker ${req.label} deleted successfully!`
			});
			return this.#log(`Worker ${req.label} deleted successfully! ${Instance.worker.length}`);
		});

		this.#socket.on(('edit'), (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
			if (!foundWorker) {
				this.#socket.emit('edit',{
					status: 400,
					id:req._id,
					message: `User not found`
				});
				return this.#log('User not found');
			}
			
			foundWorker.ipr = req.ipr;
			foundWorker.orderLength = req?.opl;
			this.#socket.emit('edit',{
				status: 200,
				id:req._id,
				message: `Worker ${req.label} edit successfully!`,
				data:foundWorker
			});
			return this.#log(`Worker ${req.label} edit successfully! ${Instance.worker.length}`);
		});

		this.#socket.on(('admindelete'), (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.userlabel);
			if (!foundWorker) {
				this.#socket.emit('delete',{
					status: 400,
					id:req._id,
					message: `User not found`
				});
				return this.#log('User not found');
			}

			foundWorker.delete();
			Instance.worker = Instance.worker.filter((worker) => worker.label !== req.userlabel);
			this.#socket.emit('delete',{
				status: 200,
				id:req._id,
				message: `Worker ${req.userlabel} deleted successfully!`
			});
			return this.#log(`Worker ${req.userlabel} deleted successfully! ${Instance.worker.length}`);
		});

		this.#socket.on(('adminedit'), (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.userlabel);
			if (!foundWorker) {
				this.#socket.emit('edit',{
					status: 400,
					id:req._id,
					message: `User not found`
				});
				return this.#log('User not found');
			}
			
			foundWorker.ipr = req.ipr;
			foundWorker.orderLength = req?.opl;
			this.#socket.emit('edit',{
				status: 200,
				id:req._id,
				message: `Worker ${req.userlabel} edit successfully!`,
				data:foundWorker
			});
			return this.#log(`Worker ${req.userlabel} edit successfully! ${Instance.worker.length}`);
		});

		this.#socket.on('userdata', (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
			if (!foundWorker)
				return this.#socket.emit('userdata',{
					status: 400,
					id:req._id,
					message: `User not found`
				});

				return this.#socket.emit('userdata',{
				status: 200,
				id:req._id,
				data: {
					label: foundWorker.label,
					status: foundWorker.status(),
					error:foundWorker.errorMessage,
					maxlen: foundWorker.orderLength,
					len: foundWorker.openOrder.length,
					invesment: foundWorker.Invesment,
					ipr: foundWorker.ipr,
					alive: foundWorker.alive,
					pnl: parseFloat(foundWorker.pnl).toFixed(8),
					btc: parseFloat(foundWorker.btc).toFixed(8),
					takeOrder:foundWorker.takeOrder,
					success:foundWorker.success,
					orderOpen:foundWorker.openOrder
					
				}
			});
		})

		this.#socket.on('alluser', (req) => {
			const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
			if (!foundWorker)
				return this.#socket.emit('userdata',{
					status: 400,
					id:req._id,
					message: `User not found`
				});

				return this.#socket.emit('alluser',{
				status: 200,
				id:req._id,
				data: Instance.worker
			});
		})
	}
	#log(msg) {
		var d = new Date();
		var n = d.toLocaleTimeString();
		let message = `${n} user:[SYSTEM]  message:[${msg}]`;
		console.log(message)
	}
}
module.exports = Socket;