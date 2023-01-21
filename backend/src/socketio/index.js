const socket = require("socket.io-client");
const jwt = require('jsonwebtoken');
class Socket {
	#socket;
	constructor(serect){
		const token = jwt.sign({ user: 'yourusername' }, serect);
		console.log(token);
		this.#socket = socket.connect('http://localhost:6060', { query: { token } });
		this.#socket.on('authenticated', (e) => {
			console.log(e);
		});
		this.#socket.on('system', (message) => {
			console.log(message);
		});

		this.#socket.on('pong',(message) =>{
			console.log(message)
		})
	}

	add(req,res){
		this.#socket.emit('add',req.body, (response) => {
			return res.status(response.status).json(response);
		  });
	}

	delete(req,res){
		this.#socket.emit('delete',req.body, (response) => {
			return res.status(response.status).json(response);
		  });
	}

	arbitrage(_,res){
		this.#socket.emit('arbitrage',_.body, (response) => {
			return res.status(response.status).json(response);
		  });
	}


}

module.exports = Socket;

