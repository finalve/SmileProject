const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors')
const userRoutes = require('./src/routes/user');
const config = require('./config');
const db = require("./src/models");
const app = express();
const PORT = 8080;
app.use(express.json());
app.use(cors());
app.listen(PORT, () => console.log(`app listening on port ${PORT}!`));
app.use('/api', userRoutes);

const Role = db.role;
mongoose.connect(`mongodb://${config.root}:${config.pwd}@${config.host}:${config.port}/${config.db}`, { useNewUrlParser: true }).then(() => {
	console.log("Successfully connect to MongoDB.");
	initial();
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
		}
	});
}