const mongoose = require('mongoose');

const ArticleSchema = mongoose.Schema({
		userId: mongoose.SchemaTypes.ObjectId,
		title: String,
		text: String,
		tags: [String]
	},
	{versionKey: false});

module.exports = mongoose.model('Article', ArticleSchema);