const Article = require('../models/article.model.js');

exports.create = async (req, res) => {
	const article = new Article(req.body);
	try {
		const savedArticle = await article.save({rawResult: true});
		res.status(201).send(savedArticle);
	} catch (err) {
		res.status(500).send({
			message: err.message || "Unknown error while creating the Article."
		});
	}
};

exports.update = async (req, res) => {
	const articleId = req.params.articleId;
	try {
		const updatedArticle = await Article.findByIdAndUpdate(articleId, req.body, {"new": true});

		if (!updatedArticle) {
			return create404NotFoundError(res, req);
		}
		res.status(200).send(updatedArticle);
	} catch (err) {
		if (err.kind === 'ObjectId') {
			return create404NotFoundError(res, req);
		}
		return res.status(500).send({
			message: "Error updating article with id " + articleId
		});
	}
};

exports.delete = async (req, res) => {
	try {
		const deletedArticle = await Article.findByIdAndRemove(req.params.articleId);

		if (!deletedArticle) {
			return create404NotFoundError(res, req);
		}
		res.status(200).send(deletedArticle);
	} catch (err) {
		if (err.kind === 'ObjectId' || err.name === 'NotFound') {
			return create404NotFoundError(res, req);
		}
		return res.status(500).send({
			message: "Could not delete article with id " + req.params.articleId
		});
	}
};

exports.findAll = async (req, res) => {
	try {
		const articles = await Article.find();
		res.status(200).send(articles);
	} catch (err) {
		res.status(500).send({message: err.message || "Unknown error while retrieving articles."});
	}
};

function create404NotFoundError(res, req) {
	return res.status(404).send({
		message: "Article not found with id " + req.params.articleId
	});
}