const validateReqBody = require('../middlewares/validator');
const Worker = require('../controllers/worker');
const Instance = require('../controllers/instance');
const data = require("../controllers/data");
class socket {
	#PORT = 5060;
	#socket;
	constructor(io) {
		this.#socket = io;
		this.#socket.on('connection', (socket) => {
			console.log('New client connected');
			socket.emit('authenticated', 'already connect to process!');
			socket.on('disconnect', () => {
				console.log('Client disconnected');
			});
			socket.on(('add'), (req, callback) => {
				if (Instance.worker.find((worker) => worker.apikey === req.apikey)) {
					callback({
						status: 400,
						message: `KEY or Label already exists!`
					});
					return this.#log(`Worker ${req.label} already exists!`);
				}

				const newWorker = new Worker(req);
				Instance.worker.push(newWorker);
				callback({
					status: 200,
					message: `${req.label} connect to server!`
				});
				return this.#log(`Worker ${req.label} connect to server!`);
			});
			socket.on(('delete'), (req, callback) => {
				const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
				if (!foundWorker) {
					callback({
						status: 400,
						message: `User not found`
					});
					return this.#log('User not found');
				}

				foundWorker.delete();
				Instance.worker = Instance.worker.filter((worker) => worker.label !== req.label);
				callback({
					status: 200,
					message: `Worker ${req.label} deleted successfully!`
				});
				return this.#log(`Worker ${req.label} deleted successfully! ${Instance.worker.length}`);
			});

			socket.on('ping', () =>
				socket.emit('pong', 'server pong')
			)

			socket.on('arbitrage', (_, callback) => {
				callback({
					status: 200,
					message: data.arbitrage
				})
			})
		});

		this.#socket.on('authenticationError', (error) => {
			console.log('authentication error', error);
		});
	}
	boardcast(msg) {
		this.#socket.emit('system', msg)
	}

	#log(msg) {
		var d = new Date();
		var n = d.toLocaleTimeString();
		let message = `${n} user:[SYSTEM]  message:[${msg}]`;
		console.log(message)
		this.boardcast(message);
	}
}

module.exports = socket;