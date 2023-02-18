const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const { verifySignUp, authJwt, validateReqBody } = require("../middlewares");

router.post('/signup', [
	verifySignUp.checkRolesExisted,
	validateReqBody(['label', 'username', 'password'])
], userCtrl.register);
router.post('/signin', userCtrl.login);
router.post('/add', [authJwt.verifyToken], userCtrl.add);
router.post('/delete', [authJwt.verifyToken], userCtrl.delete);
router.post('/rmorder', [authJwt.verifyToken], userCtrl.rmorder);
router.get('/userdata', [authJwt.verifyToken], userCtrl.userdata);
router.post('/edit', [authJwt.verifyToken], userCtrl.edit);
router.delete('/logout', [authJwt.verifyToken], (req,res)=>{
	let token = req.headers["x-access-token"];
	authJwt.revokeToken(token);
	authJwt.clearOldToken();
	res.json({ status:1022, message: 'Token revoked' });
});
router.get('/getipaddress',  userCtrl.getipaddress);
router.get('/getserveraddress',  userCtrl.getserveraddress);
router.get('/alluser', [authJwt.verifyToken,authJwt.isAdmin], userCtrl.alluser);
router.post('/adminedit', [authJwt.verifyToken,authJwt.isAdmin], userCtrl.adminedit);
router.post('/admindelete', [authJwt.verifyToken,authJwt.isAdmin], userCtrl.admindelete);
router.post('/adminrmorder', [authJwt.verifyToken,authJwt.isAdmin], userCtrl.adminrmorder);

// router.get('/arbitrage', [authJwt.verifyToken], userCtrl.arbitrage);
// router.get('/history', [authJwt.verifyToken], userCtrl.history);
module.exports = router;