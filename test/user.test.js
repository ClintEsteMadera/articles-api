const User = require('../app/models/user.model.js');

const _ = require('lodash');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

const JWT_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YWY2MzI4M2JkNDRkYzQ2OGRhYTdhODgiLCJuYW1lIjoiQ2xpbnRFc3RlTWFkZXJhIiwiYXZhdGFyIjoiaHR0cHM6Ly9ncmF2YXRhci5jb20vY2xpbnRlc3RlbWFkZXJhIiwiaWF0IjoxNTI2MzQyMDYwLCJleHAiOjE1NTc4NzgwNjB9.E0rSex56ri2ti3YZOYN3lyTkBNDnbX_q9UmcA4ar4v0';

const VALID_USER = {
	name: "ClintEsteMadera",
	avatar: "https://en.gravatar.com/clintestemadera"
};

describe('Users', () => {

	beforeEach(async () => {
		return await User.remove({});
	});

	after(async () => {
		return await User.remove({});
	});

	describe('/GET users', () => {
		it('it should FIND all the users', async () => {
			const validPayload = _.extend({}, VALID_USER);
			await createUser(validPayload);
			await createUser(validPayload);

			return new Promise(resolve => {
				chai.request(server)
					.get('/users')
					.set('Authorization', JWT_TOKEN)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.an('array');
						res.body.length.should.equal(2);
						resolve();
					});
			});
		});
	});

	describe('/POST users', () => {
		it('it should NOT CREATE a user without a name', (done) => {
			let userWithoutAName = _.omit(VALID_USER, "name");

			chai.request(server)
				.post('/users')
				.set('Authorization', JWT_TOKEN)
				.send(userWithoutAName)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.be.an('array');
					res.body.message.length.should.equal(1);
					res.body.message[0].should.equal("\"name\" is required");
					done();
				});
		});
		it('it should CREATE a user without an avatar', (done) => {
			let userWithoutAnAvatar = _.omit(VALID_USER, "avatar");

			chai.request(server)
				.post('/users')
				.set('Authorization', JWT_TOKEN)
				.send(userWithoutAnAvatar)
				.end((err, res) => {
					res.should.have.status(201);
					assertBothMatchExceptForIdField(userWithoutAnAvatar, res.body);
					done();
				});
		});
		it('it should NOT CREATE a user with an avatar which is not a URI', (done) => {
			let userWithAnAvatarWhichIsNotAURL = Object.assign({}, VALID_USER, {avatar: "notAURI"});

			chai.request(server)
				.post('/users')
				.set('Authorization', JWT_TOKEN)
				.send(userWithAnAvatarWhichIsNotAURL)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.be.an('array');
					res.body.message.length.should.equal(1);
					res.body.message[0].should.equal("\"avatar\" must be a valid uri");
					done();
				});
		});
		it('it should CREATE a valid user', async () => {
			return new Promise(resolve => {
				chai.request(server)
					.post('/users')
					.set('Authorization', JWT_TOKEN)
					.send(VALID_USER)
					.end((err, res) => {
						res.should.have.status(201);
						assertBothMatchExceptForIdField(VALID_USER, res.body);
						resolve();
					});
			});
		});
	});
});

function assertBothMatchExceptForIdField(expected, actual) {
	actual.should.be.an('object');
	const newActual = _.omit(actual, "_id");
	newActual.should.deep.equal(expected);
}

async function createUser(userData) {
	let validUser = new User(userData);
	return await validUser.save();
}