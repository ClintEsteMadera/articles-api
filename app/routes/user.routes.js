const validate = require('express-validation');
const userValidationSchema = require('../models/user.schema');

module.exports = (app) => {
	const userController = require('../controllers/user.controller.js');

	app.post('/users', validate(userValidationSchema), userController.create);

	app.get('/users', userController.findAll);
};