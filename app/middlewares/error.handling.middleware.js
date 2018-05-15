const _ = require('lodash');
const expressValidation = require('express-validation');
const env = process.env.NODE_ENV;

module.exports = (err, req, res, next) => {
	if (err instanceof expressValidation.ValidationError) {
		return res.status(err.status).json({
			message: _.flatMap(err.errors, e => e.messages)
		});
	}
	// other type of errors, it *might* also be a Runtime Error
	if (env !== 'production') {
		return res.status(500).send(err.stack);
	} else {
		return res.status(500);
	}
};