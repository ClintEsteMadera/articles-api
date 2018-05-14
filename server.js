const express = require('express');
const expressValidation = require('express-validation');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const morganBody = require('morgan-body');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const mongoose = require('mongoose');
const dbConfig = require('./config/database.config.js');

const statusRoutes = require('./app/routes/status.routes.js');
const userRoutes = require('./app/routes/user.routes.js');
const articlesRoutes = require('./app/routes/article.routes.js');

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());		// must parse body before morganBody as body will be logged

const env = process.env.NODE_ENV;

if (env !== 'test') {
	app.use(morgan(env === 'production' ? 'tiny' : 'dev'));
	morganBody(app);
}

app.use(function (err, req, res, next) {
	if (err instanceof expressValidation.ValidationError) return res.status(err.status).json(err.errors);

	// other type of errors, it *might* also be a Runtime Error
	if (env !== 'production') {
		return res.status(500).send(err.stack);
	} else {
		return res.status(500);
	}
});

mongoose.Promise = global.Promise;

tryDbConnection();

statusRoutes(app);
userRoutes(app);
articlesRoutes(app);

// TODO Make http port configurable
const httpPort = 3000;

app.listen(httpPort, () => {
	winston.info(`Articles API is listening on port ${httpPort}`);
});

module.exports = app; // for testing

async function tryDbConnection() {
	try {
		await mongoose.connect(dbConfig.url);
		winston.info(`Successfully connected to the DB at ${dbConfig.url}`);
	} catch (err) {
		winston.info(`Could not connect to the DB (${dbConfig.url}). Exiting...`);
		process.exit();
	}
}