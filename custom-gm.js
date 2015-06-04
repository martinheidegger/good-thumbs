var gm_raw = require('gm');
var im_raw = gm_raw.subClass({imageMagick: true});
var Gravity = require('./gravity/index.js');
var calculateSize = require('./lib/calculateSize');

var gravities = {};
gravities[Gravity.north] = {x: 0.5, y: 0};
gravities[Gravity.south] = {x: 0.5, y: 1};
gravities[Gravity.east] = {x: 1, y: 0.5};
gravities[Gravity.center] = {x: 0.5, y: 0.5};
gravities[Gravity.west] = {x: 0, y: 0.5};
//NorthWest|North|NorthEast|West|Center|East|SouthWest|South|SouthEast
//As of May 2015 sharp doesn't support the other types yet.

module.exports = function (options) {
	var gmMaster = options.imageMagick ? im_raw : gm_raw;
	var result = function (source, target, format, callback) {
		var gm = gmMaster(source)
		gm.size(function (err, sourceSize) {
			if (err) {
				return callback(err);
			}
			if (format.withoutEnlargement && format.width > sourceSize.width && format.height > sourceSize.height) {
				// ignore small items
			} else {
				if (format.fill) {
					var width = format.width;
					var height = format.height;
					var sourceF = sourceSize.width/sourceSize.height;
					var formatF = width/height;
					var gravity = gravities[format.gravity] || gravities[Gravity.center];
					if (formatF < sourceF) {
						width = format.height*sourceF;
					} else {
						height = format.width/sourceF;
					}
					gm.resize(width, height);
					gm.crop(format.width, format.height,
						Math.round((width-format.width) * gravity.x),
						Math.round((height-format.height) * gravity.y)
					);
				} else {
					gm.resize(format.width, format.height);
				}
			}
			if (options.type === 'jpeg' || options.type === 'png') {
				gm.stream(options.type, function (err, stdout) {
					if (err) {
						return callback(err);
					}
					var writeStream = fs.createWriteStream(target);
					var error = false;
					writeStream.on('error', function (err) {
						error = true;
						callback(err);
					});
					writeStream.on('end', function () {
						if (!error) {
							callback();
						}
					});
					stdout.pipe(writeStream);
				});
			} else {
				gm.write(target, callback);
			}
		});
	};
	result.name = options.name;
	return result;
};