const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const { verifySignUp, authJwt, validateReqBody } = require("../middlewares");

router.post('/register', [
	verifySignUp.checkRolesExisted,
	validateReqBody(['label', 'username', 'password'])
], userCtrl.register);
router.post('/login', userCtrl.login);
router.post('/add', [authJwt.verifyToken], userCtrl.add);
router.post('/delete', [authJwt.verifyToken], userCtrl.delete);
router.get('/arbitrage', [authJwt.verifyToken], userCtrl.arbitrage);
router.get('/userdata', [authJwt.verifyToken], userCtrl.userdata);
module.exports = router;