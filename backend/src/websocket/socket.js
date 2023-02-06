class Socket {
	#socket;
	#clients = [];
	constructor(io) {
		this.#socket = io;
		this.users = [];
		this.clientResponse = new Map();
		this.#socket.on('connection', (socket) => {
			const clientsCount = this.#socket.engine.clientsCount;
			console.log(`server-${clientsCount} connected`);
			this.#clients.push({
				name: `server-${clientsCount}`,
				id: socket.id
			})

			socket.on('disconnect', () => {
				const FoundServer = this.#clients.find(server => server.id === socket.id);
				this.#clients = this.#clients.filter(server => server !== FoundServer);
				console.log(`${FoundServer.name} Disconnected`);
			});

			socket.on('add', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('delete', (res) => {
				this.clientResponse.set(res.id, res);
			});

			socket.on('userdata', (res) => {
				this.clientResponse.set(res.id, res);
			});
		});
	}
	response(req, res) {
		req.body._id = `${Math.random()}`
		this.#socket.to(this.#clients[0]?.id).emit(`${req.path.replace('/', '')}`, req.body)
		setTimeout(() => {
			const response = this.clientResponse.get(req.body._id);
			if (!response)
				return res.status(500).json({ message: 'Internal Server Error' })
			this.clientResponse.delete(req.body._id)
			return res.status(response.status)
				.json({
					status: response?.status,
					message: response?.message,
					data: response?.data
				});
		}, 250);
	}
}
module.exports = { Socket };