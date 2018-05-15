const Article = require('../app/models/article.model.js');
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

const FIRST_TAG = "first";
const SECOND_TAG = "second";
const THIRD_TAG = "third tag";

const VALID_ARTICLE = {
	userId: "<to be completed after creating the user in the DB>",
	title: "This is my first article!",
	text: "This is the content of my article",
	tags: [FIRST_TAG, SECOND_TAG]
};

let validUserInDB;

describe('Articles', () => {

	before(async () => {
		validUserInDB = await createUser(VALID_USER);
		return Promise.resolve(validUserInDB);
	});

	beforeEach(async () => {
		return await Article.remove({});
	});

	after(async () => {
		return await (Promise.all([User.remove({}), Article.remove({})]));
	});

	describe('/GET articles', () => {
		it('it should FIND all the articles', async () => {
			const validPayload = _.extend(VALID_ARTICLE, {userId: validUserInDB.id});
			await createArticle(validPayload);
			await createArticle(validPayload);

			return new Promise(resolve => {
				chai.request(server)
					.get('/articles')
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

	describe('/POST articles', () => {
		it('it should NOT CREATE an article without a title', (done) => {
			let articleWithoutATitle = _.omit(VALID_ARTICLE, "title");

			chai.request(server)
				.post('/articles')
				.set('Authorization', JWT_TOKEN)
				.send(articleWithoutATitle)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.be.an('array');
					res.body.message.length.should.equal(1);
					res.body.message[0].should.equal("\"title\" is required");
					done();
				});
		});
		it('it should NOT CREATE an article with a non-existent userId', (done) => {
			let articleThatBelongsToNonExistentUser = _.extend(VALID_ARTICLE, {userId: "nonExistentUserId"});

			chai.request(server)
				.post('/articles')
				.set('Authorization', JWT_TOKEN)
				.send(articleThatBelongsToNonExistentUser)
				.end((err, res) => {
					res.should.have.status(404);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.be.a('string');
					res.body.message.should.equal("User not found with id nonExistentUserId");
					done();
				});
		});
		it('it should CREATE a valid article', async () => {
			let validArticle = _.extend(VALID_ARTICLE, {userId: validUserInDB.id});

			return new Promise(resolve => {
				chai.request(server)
					.post('/articles')
					.set('Authorization', JWT_TOKEN)
					.send(validArticle)
					.end((err, res) => {
						res.should.have.status(201);
						assertBothMatchExceptForIdField(validArticle, res.body);
						resolve();
					});
			});
		});
	});

	describe('/GET articles/byTags/:tags', () => {
		it('it should GET all articles that contain all the specified tag(s)', async () => {
			const articleThatMatches = Object.assign({}, VALID_ARTICLE, {userId: validUserInDB.id});
			const createdArticleThatMatches = await createArticle(articleThatMatches);

			// lacks of SECOND_TAG
			const articleThatDoesNotMatch = Object.assign({}, VALID_ARTICLE, {
				userId: validUserInDB.id,
				tags: [FIRST_TAG, THIRD_TAG]
			});

			await createArticle(articleThatDoesNotMatch);

			return new Promise(resolve => {
				chai.request(server)
					.get(`/articles/byTags/${FIRST_TAG},${SECOND_TAG}`) // only looking for these two tags
					.set('Authorization', JWT_TOKEN)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.an('array');
						res.body.length.should.be.eql(1);
						const actualMatch = res.body[0];
						assertBothMatchExceptForIdField(articleThatMatches, actualMatch);
						actualMatch.should.have.property('_id').equal(createdArticleThatMatches.id);
						resolve();
					});
			});
		});
		it('it should GET all articles that contain all the specified tag(s), even if they have more tags', async () => {
			// contains the two tags wanted + one more ==> should be returned as a result
			const articleThatMatches = _.extend(VALID_ARTICLE, {
				userId: validUserInDB.id,
				tags: [FIRST_TAG, SECOND_TAG, THIRD_TAG]
			});
			const createdArticleThatMatches = await createArticle(articleThatMatches);

			return new Promise(resolve => {
				chai.request(server)
					.get(`/articles/byTags/${FIRST_TAG},${SECOND_TAG}`) // only looking for these two tags
					.set('Authorization', JWT_TOKEN)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.an('array');
						res.body.length.should.be.eql(1);
						res.body[0].should.have.property('_id').eql(createdArticleThatMatches.id);
						resolve();
					});
			});
		});
	});

	describe('/PUT/:id articles', () => {
		it('it should UPDATE an article by a given id', async () => {
			const validArticle = _.extend(VALID_ARTICLE, {userId: validUserInDB.id});
			const createdArticle = await createArticle(validArticle);
			const validUpdate = _.extend(validArticle, {title: "A new title"});

			return new Promise(resolve => {
				chai.request(server)
					.put('/articles/' + createdArticle.id)
					.set('Authorization', JWT_TOKEN)
					.send(validUpdate)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						const actualMatch = res.body;
						assertBothMatchExceptForIdField(validUpdate, actualMatch);
						actualMatch.should.have.property('_id').equal(createdArticle.id);
						resolve();
					});
			});
		});
		it(`it should reject UPDATEs when the payload contains an '_id' field`, async () => {
			const validArticle = _.extend(VALID_ARTICLE, {userId: validUserInDB.id});
			const createdArticle = await createArticle(validArticle);
			const wrongUpdate = _.extend(createdArticle, {title: "A new title"});

			return new Promise(resolve => {
				chai.request(server)
					.put('/articles/' + createdArticle.id)
					.set('Authorization', JWT_TOKEN)
					.send(wrongUpdate)
					.end((err, res) => {
						res.should.have.status(400);
						res.body.should.be.a('object');
						res.body.should.have.property('message');
						res.body.message.should.be.an('array');
						res.body.message.length.should.equal(1);
						res.body.message[0].should.equal("\"_id\" is not allowed");
						resolve();
					});
			});
		});
	});

	describe('/DELETE/:id articles', () => {
		it('it should DELETE an Article by a given id', async () => {
			const validArticle = _.extend(VALID_ARTICLE, {userId: validUserInDB.id});
			const createdArticle = await createArticle(validArticle);

			return new Promise(resolve => {
				chai.request(server)
					.delete('/articles/' + createdArticle.id)
					.set('Authorization', JWT_TOKEN)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.an('object');

						const actualMatch = res.body;
						assertBothMatchExceptForIdField(validArticle, actualMatch);
						actualMatch.should.have.property('_id').equal(createdArticle.id);
						resolve();
					});
			});
		});
		it('it should NOT DELETE a non existent Article', async () => {
			return new Promise(resolve => {
				chai.request(server)
					.delete('/articles/' + "fakeId")
					.set('Authorization', JWT_TOKEN)
					.end((err, res) => {
						res.should.have.status(404);
						res.body.should.be.an('object');
						res.body.should.have.property('message');
						res.body.message.should.equal('Article not found with id fakeId');
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

async function createArticle(articleData) {
	let validArticle = new Article(articleData);
	return await validArticle.save();
}