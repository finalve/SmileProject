const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors')
const userRoutes = require('./src/routes/user');
const userSocket = require('./src/controllers/user');
const config = require('./config');
const db = require("./src/models");
const {Server} = require('socket.io');

const jwt = require('jsonwebtoken');
const app = express();
const PORT = 8080;
var {Socket} = require('./src/websocket')
app.use(express.json());
app.use(cors());
const server = app.listen(PORT, () => console.log(`app listening on port ${PORT}!`));

const io = new Server(server, {
	path: "/socket"
  });
io.use((socket, next) => {
	const token = socket.handshake.query.token;
	jwt.verify(token, config.socketSerect, (err, decoded) => {
		if (err) {
			return next(new Error('authentication error'));
		}
		socket.decoded = decoded;
		next();
	});
});
app.use((err, req, res, next) => {
	console.error(err.stack)
	res.status(500).send('Something broke!')
  })
app.use('/api', userRoutes);

const Role = db.role;
	mongoose.connect(`mongodb+srv://${config.root}:${config.pwd}@cluster0.2hz2bzb.mongodb.net/${config.db}`, { useNewUrlParser: true }).then(() => {
	console.log("Successfully connect to MongoDB.");
	initial();
	userSocket.instance(new Socket(io));
})
	.catch(err => {
		console.error("Connection error", err);
		process.exit();
	});

function initial() {
	Role.estimatedDocumentCount((err, count) => {
		if (!err && count === 0) {
			new Role({
				name: "user"
			}).save(err => {
				if (err) {
					console.log("error", err);
				}

				console.log("added 'user' to roles collection");
			});

			new Role({
				name: "moderator"
			}).save(err => {
				if (err) {
					console.log("error", err);
				}

				console.log("added 'moderator' to roles collection");
			});

			new Role({
				name: "admin"
			}).save(err => {
				if (err) {
					console.log("error", err);
				}

				console.log("added 'admin' to roles collection");
			});

			new Role({
				name: "server"
			}).save(err => {
				if (err) {
					console.log("error", err);
				}

				console.log("added 'server' to roles collection");
			});
		}
	});
}