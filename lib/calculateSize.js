module.exports = function calculateSize(sourceWidth, sourceHeight, format) {
	var targetWidth = format.width;
	var targetHeight = format.height;
	var f1 = targetWidth/targetHeight;
	var f2 = sourceWidth/sourceHeight;
	if (f1 != f2 && !format.fill) {
		if (f1 > f2) {
			targetWidth = targetHeight * f2;
		} else {
			targetHeight = targetWidth / f2;
		}
	}
	if (format.withoutEnlargement) {
		if (targetWidth > sourceWidth || targetHeight > sourceHeight) {
			targetWidth = sourceWidth;
			targetHeight = sourceHeight;
		}
	}
	if (targetWidth != sourceWidth && targetHeight != sourceHeight) {
		if (typeof targetWidth === 'number') {
			targetWidth = Math.ceil(targetWidth);
		}
		if (typeof targetHeight === 'number') {
			targetHeight = Math.ceil(targetHeight);
		}
	}
	return {
		width: targetWidth,
		height: targetHeight
	};
};