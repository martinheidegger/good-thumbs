var Sharp = require('sharp');
var Gravity = require('./gravity/index.js');
var calculateSize = require('./lib/calculateSize');

var gravities = {};
gravities[Gravity.center] = Sharp.gravity.center;
gravities[Gravity.north]  = Sharp.gravity.north;
gravities[Gravity.east]   = Sharp.gravity.east;
gravities[Gravity.south]  = Sharp.gravity.south;
gravities[Gravity.west]   = Sharp.gravity.west;

module.exports = function (options) {
	var result = function (source, target, format, callback) {	
		var s = new Sharp(source);
		s.metadata(function (err, metadata) {
			if (err) {
				return callback(err);
			}
			var size = calculateSize(metadata.width, metadata.height, format);
			if (size.width != metadata.width && size.height != metadata.height) {
				s.resize(size.width, size.height);
				s.crop(gravities[format.gravity] || Sharp.gravity.center);
			}
			if (options.optimiseScans) {
				s.optimiseScans();
			}
			if (options.type === 'jpeg') {
				s.jpeg();
			} else if (options.type === 'png') {
				s.png();
			}
			s.toFile(target, callback);
		})
	};
	result.name = options.name;
	return result;
}