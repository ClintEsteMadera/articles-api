module.exports = (app) => {
	app.get("/status", async (req, res) => {
		let uptime = Math.round((new Date() - startTime) / 1000 / 60);
		let displayableUpTime = uptime <= 1 ? "1 minute" : `${uptime} minutes`;
		res.send({online: true, uptime: displayableUpTime});
	});
};