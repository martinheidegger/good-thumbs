var util = require('util');

module.exports = function (name) {
	var ImageErrorType = function (path, format, rootError) {
		this.path = path;
		this.format = format;
		this.name = name
		Error.apply(this, ['good-thumbs/error/' + name + ' at ' + path + (format ? "@" + format : '') + (rootError ? ' cause: ' + rootError.toString() : '' )] );
	};

	util.inherits(ImageErrorType, Error);
	return ImageErrorType;
};