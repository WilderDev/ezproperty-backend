function mapToObject(map) {
	const obj = {};
	for (let [k, v] of map) {
		obj[k] = v;
	}
	return obj;
}

function convertMapofMaps(mapOfMaps) {
	const outerObj = {};
	for (let [k, v] of mapOfMaps) {
		outerObj[k] = mapToObject(v);
	}
	return outerObj;
}

module.exports = { convertMapofMaps };
