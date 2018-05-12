const Joi = require('joi');

module.exports = {
	body: {
		name: Joi.string().required(),
		avatar: Joi.string().uri().optional()
	}
};