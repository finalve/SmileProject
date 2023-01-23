const express = require("express");
const cors = require('cors')
const app = express();
const port = 9999;

app.use(express.json());
app.use(cors());
app.listen(port, () => console.log(`app listening on port ${port}!`));
const controllers = require("./app/controllers");

const { api, socket, data } = controllers;
const config = require("./app/config/auth.config");
require('./app/routes/auth.route')(app);
require("./app/routes/user.route")(app);

const db = require("./app/models");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${config.root}:${config.pwd}@${config.host}:${config.port}/${config.db}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

const exchangeInfo = async () => {
	const info = await api.exchangeInfo();
	info.forEach(element => {
		if (!data.whitelist.find(x => x === element.symbol))
		{
			data.whitelist.push({
				symbol:element.symbol,
				lotsize:element.filters.find(x=>x.filterType === 'LOT_SIZE').stepSize,
				pricefilter:element.filters.find(x=>x.filterType === 'PRICE_FILTER').tickSize
			});
		}
	});
}

exchangeInfo().then(()=>new socket(data.whitelist));
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