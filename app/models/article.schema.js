const Joi = require('joi');

module.exports = {
	body: {
		userId: Joi.string().required(),
		title: Joi.string().required(),
		text: Joi.string().required(),
		tags: Joi.array().items(Joi.string()).required()
	}
};