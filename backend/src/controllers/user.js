const db = require("../models");
const Socket = require('../socketio')
const jwt = require('jsonwebtoken');
var bcrypt = require("bcryptjs");
const config = require('../../config')
const socket = new Socket(config.socketSerect);
const Role = db.role;
const User = db.user;
exports.register = (req, res) => {
	const { username,label, password } = req.body;

	User.findOne({ username: username,label:label }, (err, user) => {
		if (err) {
			return res.status(500).json({ error: 'Error checking user in MongoDB' });
		}
		if (user) {
			return res.status(400).json({ error: 'User already exists' });
		}

		const newUser = new User({
			username: username,
			password: bcrypt.hashSync(password, 8),
			label:label,
			role: 'user'
		});
		Role.findOne({ name: "user" }, (err, role) => {
			if (err) {
			  res.status(500).send({ message: err });
			  return;
			}
	
			newUser.roles = [role._id];
			newUser.save((err) => {
				if (err) {
					return res.status(500).json({ error: err });
				}
				return res.status(200).json({ message: 'User registered successfully' });
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
				return res.status(400).json({ error: 'User not found' });
			}

			var passwordIsValid = bcrypt.compareSync(
				password,
				user.password
			  );

			if (!passwordIsValid) {
				return res.status(401).json({ error: 'Incorrect password' });
			}

			const token = jwt.sign({ label:user.label, username: user.username }, config.secret, { expiresIn: '1h' });
			var authorities = [];

			for (let i = 0; i < user.roles.length; i++) {
			  authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
			}
			res.status(200).json({
				id: user._id,
				label:user.label,
				username: user.username,
				email: user.email,
				roles: authorities,
				accessToken: token
			  });
		});
};

exports.add = (req, res) => {
	socket.add(req,res);
};

exports.delete = (req, res) => {
	socket.delete(req,res);
};

exports.arbitrage = (req, res) => {
	socket.arbitrage(req,res);
};

exports.userdata = (req, res) => {
	socket.userdata(req,res);
};