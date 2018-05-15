const Article = require('../models/article.model.js');
const User = require('../models/user.model.js');

const ARTICLE = "Article";
const USER = "User";

exports.create = async (req, res) => {
	const articlePayload = req.body;

	const user = await findUser(articlePayload.userId, res);

	// response is assumed to be populated by `findUser` already
	if (!user) {
		return;
	}
	const article = new Article(articlePayload);
	try {
		const savedArticle = await article.save({rawResult: true, new: true});
		res.status(201).send(savedArticle);
	} catch (err) {
		const errorMsg = err.message;
		if (errorMsg.includes("validation failed")) {
			res.status(400).send({ message: err.message });
		} else {
			res.status(500).send({
				message: err.message || "Unknown error while creating the Article."
			});
		}
	}
};

exports.update = async (req, res) => {
	const articleId = req.params.articleId;

	const articleUpdate = req.body;

	const user = findUser(articleUpdate.userId, res);

	// response is assumed to be populated by `findUser` already
	if (!user) {
		return;
	}
	try {
		const updatedArticle = await Article.findByIdAndUpdate(articleId, req.body, {new: true});

		if (!updatedArticle) {
			return send404NotFoundError(ARTICLE, articleId, res);
		}
		res.status(200).send(updatedArticle);
	} catch (err) {
		if (err.kind === 'ObjectId') {
			return send404NotFoundError(ARTICLE, articleId, res);
		}
		return res.status(500).send({
			message: "Error updating article with id " + articleId
		});
	}
};

exports.delete = async (req, res) => {
	const articleId = req.params.articleId;
	try {
		const deletedArticle = await Article.findByIdAndRemove(articleId);

		if (!deletedArticle) {
			return send404NotFoundError(ARTICLE, articleId, res);
		}
		res.status(200).send(deletedArticle);
	} catch (err) {
		if (err.kind === 'ObjectId' || err.name === 'NotFound') {
			return send404NotFoundError(ARTICLE, articleId, res);
		}
		return res.status(500).send({
			message: "Could not delete article with id " + articleId
		});
	}
};

exports.findAllArticlesContainingTags = async (req, res) => {
	try {
		const tags = req.params.tags.split(',');
		// Looks for articles matching "all" tags. If we just want OR behavior, we'd replace "$all" with "$in"
		const articles = await Article.find({
			tags: { $all: tags }
		});
		res.status(200).send(articles);
	} catch (err) {
		res.status(500).send({message: err.message || "Unknown error while retrieving articles."});
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

async function findUser(userId, res) {
	let user;
	try {
		user = await User.findById(userId);
		if (!user) {
			send404NotFoundError(USER, userId, res);
			return null;
		}
	} catch (err) {
		if (err.kind === 'ObjectId') {
			send404NotFoundError(USER, userId, res);
		} else {
			res.status(500).send({
				message: "Unknown error while retrieving User with id " + userId
			});
		}
	}
	return user;
}

function send404NotFoundError(entityName, id, res) {
	res.status(404).send({
		message: `${entityName} not found with id ${id}`
	});
}