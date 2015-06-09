var mkdirp = require('mkdirp');
var Path = require('path');
var fs = require('fs');

var hash = require('./lib/hash');

var MissingFormatError = require('./error/MissingFormatError');
var SourceMissingError = require('./error/SourceMissingError');
var IllegalPathError   = require('./error/IllegalPathError');
var ConvertError       = require('./error/ConvertError');

function GoodThumbs(options) {
	if (!(this instanceof GoodThumbs)) {
		return new GoodThumbs(options);
	}
	this.cacheDir = Path.resolve(options.cacheDir);
	mkdirp.sync(this.cacheDir);
	this.cwd = Path.resolve(options.cwd);
	this.timestamps = {};
	this.createCallbacks = {};
	this.presets = options.presets || {};
	this.checkInterval = options.checkInterval || 0;
	this.system = options.system;
	if (!this.system) {
		try {
			this.system = require('./vips');
		} catch (e) {
			this.system = require('./imageMagick');
		}
	}
}
GoodThumbs.prototype.createByPreset = function(source, preset, callback) {
	if (typeof preset !== 'string') {
		return setImmediate(
			callback.bind(null, new MissingFormatError(source, preset))
		);
	}
	return this.create(source, preset, callback);
};
GoodThumbs.prototype.create = function (source, inputFormat, callback) {
	setImmediate(function () {

		source = Path.resolve(this.cwd, source);

		if( Path.relative(this.cwd, source).substr(0, 2) === '..' ) {
			return callback(new IllegalPathError(source));
		}

		var format = typeof inputFormat === 'string' ? this.presets[inputFormat] : inputFormat;
		if (!format) {
			return callback(new MissingFormatError(source, inputFormat));
		}

		var formatParams = {
			width:   format.width,
			height:  format.height,
			fill:    format.fill || false,
			type:    format.type || Path.extname(source).substr(1),
			gravity: format.gravity || require('./gravity/center'),
			quality: (typeof format.quality === 'number' ? format.quality : 85),
			withoutEnlargement: (typeof format.withoutEnlargement === 'boolean' ? format.withoutEnlargement : true)
		};

		var key = hash(JSON.stringify({f: format, s: source})) + '.' + formatParams.type;
		var target = Path.join(this.cacheDir, key);
		var timestamps = this.timestamps;

		if (typeof timestamps[key] === 'number') {
			if (   timestamps[key] > Date.now()
				&& timestamps[key] > fs.statSync(source).mtime) {
				return callback(null, target);
			} else {
				delete timestamps[key];
			}
		}

		var createCallbacks = this.createCallbacks;
		if (!createCallbacks[key]) {
			if (!fs.existsSync(source)) {
				return callback(new SourceMissingError(source));
			}

			createCallbacks[key] = [callback];

			var checkTime = Date.now() + this.checkInterval;
			this.system(source, target, formatParams, function (err) {
				var callbacks = createCallbacks[key];
				if (err) {
					console.log(err)
					err = new ConvertError(source, format, err);
				}
				delete createCallbacks[key];
				callbacks.forEach(function (callback) {
					callback(err, err ? undefined : target);
				});
			});
		} else {
			createCallbacks[key].push(callback);
		}
	}.bind(this));
}
module.exports = GoodThumbs;