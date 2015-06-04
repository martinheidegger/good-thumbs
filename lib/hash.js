var crypto = require('crypto');

module.exports = function hash(path) {
	var c = crypto.createHash('sha256');
	c.update(path);
	return c.digest('base64').replace(/\//ig, '_');
};