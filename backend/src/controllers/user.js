const db = require("../models");
const jwt = require('jsonwebtoken');
var bcrypt = require("bcryptjs");
const config = require('../../config')

const Role = db.role;
const User = db.user;

var socket = null;
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
				const token = jwt.sign({ label: newUser.label, username: newUser.username, userId: newUser._id }, config.secret, { expiresIn: '24h' });
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

			const token = jwt.sign({ label: user.label, username: user.username, userId: user._id }, config.secret, { expiresIn: '1m' });
			var authorities = [];

			for (let i = 0; i < user.roles.length; i++) {
				authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
			}
			res.status(200).json({
				userId: user._id,
				label: user.label,
				username: user.username,
				roles: authorities,
				accessToken: token
			});
		});
};

exports.add = (req, res) => {
	socket.response(req, res);
};

exports.delete = (req, res) => {
	socket.response(req, res);
};

exports.userdata = (req, res) => {
	socket.response(req, res);
};

exports.edit = (req, res) => {
	socket.response(req, res);
};

// exports.arbitrage = (req, res) => {
// 	socket.arbitrage(req,res);
// };



// exports.history = (req, res) => {
// 	socket.history(req,res);
// };