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
GoodThumbs.prototype.createAll = function (presets, callback) {
	if (typeof presets === 'function') {
		callback = presets;
		presets = null;
	}
	if (!presets) {
		presets = this.presets;
	}
	var that = this;
	require('glob')('/**/*.{jpg,JPG,jpeg,png,PNG,gif,GIF}', {
		root: this.cwd
	}, function (err, sourceFiles) {
		if (err) {
			return callback(err);
		}
		var combinations = require('./lib/createCombinations')(sourceFiles, Object.keys(presets))
		var result = {};
		require('async').eachLimit(combinations, 4, function (combi, callback) {
			var source = combi.a;
			var preset = combi.b;
			that.createByPreset(source, preset, function (err, target) {
				if (err) {
					return callback(err);
				}
				var thumbList = result[source];
				if (!thumbList) {
					thumbList = {};
					result[source] = thumbList;
				}
				thumbList[preset] = target;
				callback();
			});
		}, function (err) {
			if (err) {
				return callback(err);
			}
			callback(null, result);
		});
	})
};
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

		var format;
		var formatName;
		if (typeof inputFormat === 'string') {
			format = this.presets[inputFormat];
			formatName = inputFormat;
		} else {
			format = inputFormat;
		}
		if (format.name) {
			formatName = format.name;
		}
		if (!format) {
			return callback(new MissingFormatError(source, inputFormat));
		}

		var sourceExt = Path.extname(source).substr(1).toLowerCase();
		var formatParams = {
			width:   format.width,
			height:  format.height,
			fill:    format.fill || false,
			gravity: format.gravity || require('./gravity/center'),
			type:    (format.type || sourceExt).toLowerCase(),
			quality: (typeof format.quality === 'number' ? format.quality : 85),
			withoutEnlargement: (typeof format.withoutEnlargement === 'boolean' ? format.withoutEnlargement : true)
		};
		if (!formatName) {
			formatName = hash(JSON.stringify(formatParams));
		}

		// Remove the extension from the key to 
		var key = Path.relative(this.cwd, source);
		if (sourceExt === formatParams.type) {
			key = key.substr(0, key.length - sourceExt.length - 1);
		}

		key = key + '.' + formatName + '.' + formatParams.type;
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
			fs.exists(source, function (exists) {
				if (!exists) {
					return callback(new SourceMissingError(source));
				}
				createCallbacks[key] = [callback];
				mkdirp(Path.dirname(target), function (err) {
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
				}.bind(this));
			}.bind(this));
		} else {
			createCallbacks[key].push(callback);
		}
	}.bind(this));
};
module.exports = GoodThumbs;