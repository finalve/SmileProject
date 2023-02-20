const jwt = require("jsonwebtoken");
const config = require("../../config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const revokedTokens = new Set('');
revokeToken = (token) => {
	revokedTokens.add(token);
}
const parseJwt = (token) => {
	try {
		return JSON.parse(atob(token.split('.')[1]));
	} catch (e) {
		return null;
	}
};
clearOldToken = () => {
	revokedTokens.forEach((token) => {
		const decodedJwt = parseJwt(token);
		if (decodedJwt.exp * 1000 < Date.now()) revokedTokens.delete(token)
	});
};
verifyToken = (req, res, next) => {
	let token = req.headers["x-access-token"];

	if (!token) return res.status(403).send({ message: "No token provided!" });
	if (revokedTokens.has(token)) return res.status(401).send({ status: 1022, message: 'Token has been revoked.' });

	jwt.verify(token, config.secret, (err, decoded) => {
		if (err) {
			return res.status(401).send({ message: "Unauthorized!" });
		}
		if (decoded.ip !== req.headers["x-real-ip"]) return res.status(400).json({status: 1021, message: "Can't Cross IP Address!" });
		req.body.label = decoded.label;
		req.server = decoded.server;
		req.userId = decoded.userId;
		next();
	});
};

isAdmin = (req, res, next) => {
	User.findById(req.userId).exec((err, user) => {
		if (err) {
			res.status(500).send({ message: err });
			return;
		}

		Role.find(
			{
				_id: { $in: user.roles }
			},
			(err, roles) => {
				if (err) {
					res.status(500).send({ message: err });
					return;
				}

				for (let i = 0; i < roles.length; i++) {
					if (roles[i].name === "admin") {
						next();
						return;
					}
				}

				res.status(403).send({ message: "Require Admin Role!" });
				return;
			}
		);
	});
};

isModerator = (req, res, next) => {
	User.findById(req.userId).exec((err, user) => {
		if (err) {
			res.status(500).send({ message: err });
			return;
		}

		Role.find(
			{
				_id: { $in: user.roles }
			},
			(err, roles) => {
				if (err) {
					res.status(500).send({ message: err });
					return;
				}

				for (let i = 0; i < roles.length; i++) {
					if (roles[i].name === "moderator") {
						next();
						return;
					}
				}

				res.status(403).send({ message: "Require Moderator Role!" });
				return;
			}
		);
	});
};

const authJwt = {
	verifyToken,
	isAdmin,
	isModerator,
	revokeToken,
	clearOldToken
};
module.exports = authJwt;