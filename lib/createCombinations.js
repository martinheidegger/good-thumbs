module.exports = function createCombinations(arrayA, arrayB) {
	return arrayA.reduce(function (result, a) {
		return result.concat(arrayB.map(function (b) {
			return {a: a, b: b};
		}))
	}, [])
}