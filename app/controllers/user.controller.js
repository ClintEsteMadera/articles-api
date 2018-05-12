const User = require('../models/user.model.js');

exports.create = async (req, res) => {
	const user = new User(req.body);
	try {
		const savedUser = await user.save();
		res.send(savedUser);
	} catch (err) {
		res.status(500).send({
			message: err.message || "Unknown error while creating the User."
		});
	}
};

exports.findAll = async (req, res) => {
	try {
		const users = await User.find();
		res.send(users);
	} catch (err) {
		res.status(500).send({
			message: err.message || "Unknown error while retrieving users."
		});
	}
};
