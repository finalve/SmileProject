const port = 8080;
const User = require("../dbs/user.db");
const instance = require("../dbs/instance.db");
const { validateReqBody } = require("../middlewares/validator.mid");

module.exports = (app) => {
	app.listen(port,() => console.log(`app listening on port ${port}!`));

	app.get('/api', (_, res) => {
		res.json(instance.users.map(users=>{
			return {
				username:users.username,
				status:users.status}
		}))
	} );
	app.get('/api/create', (_, res) => res.redirect('/api'));
	app.get('/api/delete', (_, res) => res.redirect('/api'));
	app.post('/api/create', [validateReqBody(['username', 'password', 'apikey', 'apiserect'])], (req, res) => {
		if (instance.users.find((user) => user.username === req.body.username || user.apikey === req.body.apikey))
			return res.status(400).json({ error: 'User already exists' });
		try {
			const newUser = new User(req.body);
			instance.users.push(newUser);
			return res.status(201).json({ message: 'User created successfully' });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	})

	app.post('/api/delete', validateReqBody(['username', 'password']), (req, res) => {
		const foundUser = instance.users.find((user) => user.username === req.body.username);
		if (!foundUser)
			return res.status(404).json({ error: 'User not found' });

		if (!foundUser.delete(req.body))
			return res.status(400).json({ error: 'Invalid password' });
			instance.users = instance.users.filter((user) => user.username !== req.body.username);
		res.json({ message: 'User deleted successfully' });

	})
}