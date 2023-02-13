const socket = require("socket.io-client");
const jwt = require('jsonwebtoken');
const { withTimeout } = require("../middlewares");
class Socket {
	#socket;
	constructor(serect){
		const token = jwt.sign({ user: 'server-1' }, serect);
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

		this.#socket.on('close',(message) =>{
			console.log(message)
		})
	}

	add(req,res){
		this.#socket.emit('add',req.body,withTimeout((response)=> {
			return res.status(response.status).json(response);
		  },()=>{
			return res.status(500).json({message:'Internal Server Error'})
		  },1000)
		  );
	}

	delete(req,res){
		this.#socket.emit('delete',req.body,withTimeout((response)=> {
			return res.status(response.status).json(response);
		  },()=>{
			return res.status(500).json({message:'Internal Server Error'})
		  },1000)
		  );
	}

	arbitrage(_,res){
		this.#socket.emit('arbitrage',_.body,withTimeout((response)=> {
			return res.status(response.status).json(response);
		  },()=>{
			return res.status(500).json({message:'Internal Server Error'})
		  },1000)
		  );
	}

	userdata(req,res){
		this.#socket.emit('userdata',req.body,withTimeout((response)=> {
			return res.status(response.status).json(response);
		  },()=>{
			return res.status(500).json({message:'Internal Server Error'})
		  },1000)
		  );
	}

	history(req,res){
		this.#socket.emit('history',req.body,withTimeout((response)=> {
			return res.status(response.status).json(response);
		  },()=>{
			return res.status(500).json({message:'Internal Server Error'})
		  },1000)
		  );
	}


}

module.exports = Socket;

