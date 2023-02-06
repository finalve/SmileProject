const socket = require("socket.io-client");
const Worker = require('../controllers/worker');
const Instance = require('../controllers/instance');
class Socket {
	#socket;
	constructor(){
		//const token = jwt.sign({ user: 'yourusername' }, serect);
		//this.#socket = socket.connect('http://localhost:6060', { query: { token } });
		this.#socket = socket.connect('http://localhost:8080');
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
					status: foundWorker.status,
					maxlen: foundWorker.orderLength,
					len: foundWorker.openOrder.length,
					invesment: foundWorker.Invesment,
					ipr: foundWorker.ipr,
					alive: foundWorker.alive,
					pnl: parseFloat(foundWorker.pnl).toFixed(8),
					orderOpen:foundWorker.openOrder
				}
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