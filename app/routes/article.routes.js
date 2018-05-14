const Joi = require('joi');
const validate = require('express-validation');
const articleValidationSchema = require('../models/article.schema');

module.exports = (app) => {
    const articleController = require('../controllers/article.controller.js');

    app.post('/articles', validate(articleValidationSchema), articleController.create);

    app.put('/articles/:articleId', validate(articleValidationSchema), articleController.update);

    app.delete('/articles/:articleId', articleController.delete);

	app.get('/articles/byTags/:tags', validate({
		params: {
			tags: Joi.string().required()	// undefined, null or empty strings will be rejected
		}
	}), articleController.findAllArticlesContainingTags);

	app.get('/articles', articleController.findAll);
};