const express = require("express");
const cors = require('cors')
const jwt = require('jsonwebtoken');
const socketio = require('socket.io');
const {arbitrage,api,data} = require("./controllers");
const socket = require("./websocket");
const config = require('./config');
const app = express();
const port = 6060;

app.use(express.json());
app.use(cors());

const server = app.listen(port, () => console.log(`app listening on port ${port}!`));
const io = socketio(server)

io.use((socket, next) => {
    const token = socket.handshake.query.token;
    jwt.verify(token, config.serect, (err, decoded) => {
        if (err) {
            return next(new Error('authentication error'));
        }
        socket.decoded = decoded;
        next();
    });
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

exchangeInfo().then(()=>new arbitrage(data.whitelist,new socket(io)));