var bcrypt = require("bcryptjs");
class Socket {
	#socket;
	#clients = [];
	constructor(io) {
		this.ipaddress = [];
		this.#socket = io;
		this.users = [];
		this.clientResponse = new Map();
		console.log(`Socket Server Started `)
		this.#socket.on('connection', (socket) => {
			const clientsCount = this.#socket.engine.clientsCount;
			socket.emit('authenticated', `server-${clientsCount} Id ${socket.id} connected`)
			socket.emit('ipaddress', `getipaddress`)
			console.log(`server-${clientsCount} Id ${socket.id} connected`);
			this.#clients.push({
				name: `server-${clientsCount}`,
				id: socket.id
			})

			socket.on('disconnect', () => {
				const FoundServer = this.#clients.find(server => server.id === socket.id);
				this.#clients = this.#clients.filter(server => server.id !== FoundServer.id);
				console.log(`${FoundServer.name} Disconnected`);
			});

			socket.on('add', (res) => {
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
		});
	}
	response(req, res) {
		req.body._id = bcrypt.hashSync(`${Math.random()}`, 8)
		//const isNull = ['server'].filter(x => req.body[x]);
		let server = this.#clients[0]?.id;
		//if (!isNull.length)
		//	server = this.#clients.find(x => x.name === req.body.server)?.id;

		this.#socket.to(server).emit(`${req.path.replace('/', '')}`, req.body)
		setTimeout(() => {
			const response = this.clientResponse.get(req.body._id);
			if (!response)
				return res.status(500).json({ status: 500, message: 'Internal Server Error' })
			this.clientResponse.delete(req.body._id)
			return res.status(response.status)
				.json({
					status: response?.status,
					message: response?.message,
					data: response?.data
				});
		}, 750);
	}
	getUsers(req, res) {
		req.body._id = bcrypt.hashSync(`${Math.random()}`, 8)
		this.#socket.emit(`${req.path.replace('/', '')}`, req.body)
		setTimeout(() => {
			const response = this.clientResponse.get(req.body._id);
			if (!response)
				return res.status(500).json({ status: 500, message: 'Internal Server Error' })
			this.clientResponse.delete(req.body._id)
			return res.status(response.status)
				.json({
					status: response?.status,
					message: response?.message,
					data: response?.data
				});
		}, 750);
	}
}
module.exports = { Socket };