const secret = process.env.JWT_PRIVATE_KEY;

if (!secret) {
	throw new Error("Unable to load private key from environmental variable JWT_PRIVATE_KEY. Aborting...");
}

module.exports = {
	secret: secret
};
