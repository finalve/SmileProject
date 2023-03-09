const db = require("../models");
const jwt = require('jsonwebtoken');
var bcrypt = require("bcryptjs");
const config = require('../../config')

const Role = db.role;
const User = db.user;

var socket = null;
const log = (ip, msg) => {
	var d = new Date();
	var n = d.toLocaleTimeString();
	console.log(`${n} IP:[${ip}] message:[${msg}]`)
}
exports.instance = (_socket) => socket = _socket;
exports.register = (req, res) => {
	const { username, label, password } = req.body;

	User.findOne({ username: username, label: label }, (err, user) => {
		if (err) {
			return res.status(500).json({ message: 'Internal Server Error' });
		}
		if (user) {
			return res.status(400).json({ message: 'User already exists' });
		}

		const newUser = new User({
			username: username,
			password: bcrypt.hashSync(password, 8),
			label: label
		});
		Role.findOne({ name: "user" }, (err, role) => {
			if (err) {
				res.status(500).send({ message: err });
				return;
			}

			newUser.roles = [role._id];
			newUser.save((err) => {
				if (err) {
					return res.status(500).json({ message: err });
				}
				log(req.headers["x-real-ip"], `user [${newUser.label} register]`);
				const token = jwt.sign({ ip: req.headers["x-real-ip"], label: newUser.label, username: newUser.username, userId: newUser._id }, config.secret, { expiresIn: '6h' });
				var authorities = [];
				authorities.push("ROLE_" + role.name.toUpperCase());
				res.status(200).json({
					userId: newUser._id,
					label: newUser.label,
					username: newUser.username,
					roles: authorities,
					accessToken: token
				});
			});
		});

	});
};

exports.login = (req, res) => {
	const { username, password } = req.body;
	User.findOne({ username: username })
		.populate("roles", "-__v")
		.exec((err, user) => {
			if (err) {
				res.status(500).json({ message: err });
				return;
			}
			if (!user) {
				return res.status(400).json({ message: 'User not found' });
			}

			var passwordIsValid = bcrypt.compareSync(
				password,
				user.password
			);

			if (!passwordIsValid) {
				return res.status(401).json({ message: 'Incorrect password' });
			}

			const token = jwt.sign({ ip: req.headers["x-real-ip"], label: user.label, username: user.username, userId: user._id }, config.secret, { expiresIn: '6h' });
			var authorities = [];

			for (let i = 0; i < user.roles.length; i++) {
				authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
			}
			log(req.headers["x-real-ip"], `user [${user.label} login]`);
			res.status(200).json({
				ip: req.headers["x-real-ip"],
				userId: user._id,
				label: user.label,
				username: user.username,
				roles: authorities,
				accessToken: token,
			});
		});
};

exports.myserver = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `user :: ${req.body.label} get my server`);
	socket.myserver(req, res);
};

exports.add = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `user :: ${req.body.label} add worker`);
	socket.exists(req, res);
};

exports.delete = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `user :: ${req.body.label} delete worker`);
	socket.response(req, res);
};

exports.userdata = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	socket.response(req, res);
};

exports.setup = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `user :: ${req.body.label} setup worker`);
	socket.response(req, res);
};

exports.alluser = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `user :: ${req.body.label} get all user`);
	socket.response(req, res);
};


exports.adminview = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `user :: ${req.body.label} admin view user`);
	socket.response(req, res);
};

exports.rmorder = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `user :: ${req.body.label} remove order`);
	socket.response(req, res);
};

exports.adminedit = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `user :: ${req.body.label} edit user by admin`);
	socket.response(req, res);
};

exports.admindelete = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `user :: ${req.body.label} delete user by admin`);
	socket.response(req, res);
};

exports.adminrmorder = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `user :: ${req.body.label} remove order by admin`);
	socket.response(req, res);
};

exports.getipaddress = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `get ip address`);
	res.status(200).json({
		ip: req.headers["x-real-ip"]
	});
};

exports.getserveraddress = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `get server address`);
	res.status(200).json({
		ip: socket.ipaddress
	});
};

exports.getServerName = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `get server address`);
	res.status(200).json({
		servers: socket.server
	});
};
 exports.arbitrage = (req, res) => {
	req.body._ip = req.headers["x-real-ip"];
	log(req.headers["x-real-ip"], `get server address`);
 	socket.response(req,res);
};



// exports.history = (req, res) => {
// 	socket.history(req,res);
// };