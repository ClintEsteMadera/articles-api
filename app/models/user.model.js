const mongoose = require('mongoose');

require('mongoose-type-url');

const UserSchema = mongoose.Schema({
		name: String,
		avatar: mongoose.SchemaTypes.Url
	},
	{versionKey: false});

module.exports = mongoose.model('User', UserSchema);