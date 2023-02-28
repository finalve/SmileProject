var bcrypt = require("bcryptjs");
class Socket {
	#socket;
	constructor(io) {
		this.ipaddress = [];
		this.#socket = io;
		this.users = [];
		this.server = [];
		this.clientResponse = new Map();
		console.log(`Socket Server Started `)
		this.#socket.on('connection', (socket) => {
			socket.emit('ipaddress', `getipaddress`)
			socket.emit('authenticated', `Socket Id ${socket.id} connected`)
			console.log(`Socket Id ${socket.id} connected`);

			socket.on('authenticated', (res) => {
				this.server = this.server.filter(x => x.name !== res.servername)
				console.log(`Servername ${res.servername} Socket Id ${socket.id} connected`)
				this.server.push({
					name: res.servername,
					ip: res.ip,
					id: socket.id
				});
			})

			socket.on('disconnect', () => {
				const FoundServer = this.server.find(server => server.id === socket.id);
				this.server = this.server.filter(server => server.id !== FoundServer?.id);
				console.log(`${FoundServer?.name} Disconnected`);
			});

			socket.on('add', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('arbitrage', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('delete', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('rmorder', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('userdata', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('edit', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('alluser', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('adminedit', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('admindelete', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('adminrmorder', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('ipaddress', (res) => {
				this.clientResponse.set(res.id, res);
				this.ipaddress.push(res.ip);
			});

			socket.on('myserver', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('allserver', (res) => {
				this.#socket.emit(`myserver`, req.body)
			});
		});
	}
	myserver(req, res) {
		req.body._id = bcrypt.hashSync(`${Math.random()}`, 8)
		this.#socket.emit(`myserver`, req.body)
		setTimeout(() => {
			const response = this.clientResponse.get(req.body._id);
			if (!response)
				return res.status(200).json({
					status: 200,
					server: 'null'
				});
			this.clientResponse.delete(req.body._id)
			return res.status(response.status)
				.json({
					status: response?.status,
					message: response?.message,
					data: response?.data,
					server: response?.server
				});
		}, 1000);
	}
	exists(req, res) {
		req.body._id = bcrypt.hashSync(`${Math.random()}`, 8)
		this.#socket.emit(`exists`, req.body)
		setTimeout(() => {
			const response = this.clientResponse.get(req.body._id);
			if (!response)
				return this.addWorker(req, res);
			this.clientResponse.delete(req.body._id)
			return res.status(response.status)
				.json({
					status: response?.status,
					message: response?.message,
					data: response?.data,
					server: response?.server
				});
		}, 1000);
	}

	addWorker(req, res) {
		req.body._id = bcrypt.hashSync(`${Math.random()}`, 8)

		if (req.body.server === '')
			req.body.server = this.server[0]?.name
			
		this.#socket.emit(`add`, req.body)
		setTimeout(() => {
			const response = this.clientResponse.get(req.body._id);
			if (!response)
				return res.status(500).json({ status: 500, message: 'Internal Server Error' })
			this.clientResponse.delete(req.body._id)
			return res.status(response.status)
				.json({
					status: response?.status,
					message: response?.message,
					data: response?.data,
					server: response?.server
				});
		}, 1000);
	}
	userdata(req, res) {
		req.body._id = bcrypt.hashSync(`${Math.random()}`, 8)
		this.#socket.emit(`${req.path.replace('/', '')}`, req.body)
		setTimeout(() => {
			const response = this.clientResponse.get(req.body._id);
			if (!response)
				return res.status(400).json({ status: 400, message: 'User not found' });
			this.clientResponse.delete(req.body._id)
			return res.status(response.status)
				.json({
					status: response?.status,
					message: response?.message,
					data: response?.data,
					server: response?.server
				});
		}, 1000);
	}
	response(req, res) {
		req.body._id = bcrypt.hashSync(`${Math.random()}`, 8)
		this.#socket.emit(`${req.path.replace('/', '')}`, req.body)
		setTimeout(() => {
			const response = this.clientResponse.get(req.body._id);
			if (!response)
				return res.status(400).json({ status: 400, message: 'User not found' });
			this.clientResponse.delete(req.body._id)
			return res.status(response.status)
				.json({
					status: response?.status,
					message: response?.message,
					data: response?.data,
					server: response?.server
				});
		}, 1000);
	}
	old(req, res) {
		req.body._id = bcrypt.hashSync(`${Math.random()}`, 8)
		const server = this.server.find(x => x.name === req.headers["server"])?.id;
		this.#socket.to(server).emit(`${req.path.replace('/', '')}`, req.body)
		setTimeout(() => {
			const response = this.clientResponse.get(req.body._id);
			if (!response)
				return res.status(500).json({ status: 500, message: 'Internal Server Error', server: server })
			this.clientResponse.delete(req.body._id)
			return res.status(response.status)
				.json({
					status: response?.status,
					message: response?.message,
					data: response?.data,
					server: response?.server
				});
		}, 1000);
	}
}
module.exports = { Socket };