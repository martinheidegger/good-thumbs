var crypto;

module.exports = function hash(path) {
	if (!crypto) {
		crypto = require('crypto');
	}
	var c = crypto.createHash('sha256');
	c.update(path);
	return c.digest('base64').replace(/\//ig, '_');
};