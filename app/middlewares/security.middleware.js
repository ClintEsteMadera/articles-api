const parseBearerToken = require('parse-bearer-token');
const jwt = require('jsonwebtoken');
const config = require('../../config/security.config');
const _ = require('lodash');
const unsecuredPaths = ['/status'];

module.exports = function verifyToken(req, res, next) {
	if (_.includes(unsecuredPaths, req.path)) {
		return next();
	}
	const token = parseBearerToken(req);
	if (!token) {
		return res.status(401).send({message: 'Authentication failed: no token was provided.'});
	}
	jwt.verify(token, config.secret, function (err, decoded) {
		if (err) {
			return res.status(401).send({message: 'Authentication failed: could not authenticate token.'});
		}
		req.userId = decoded.id;
		next();
	});
};