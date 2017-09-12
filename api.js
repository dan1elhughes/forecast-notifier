let cache = {};

module.exports = forecast => (api, options) => new Promise(resolve => {
	if (!cache[api]) {
		let callback;
		if (options) {
			callback = resolve => (forecast[api](options, (err, value) => resolve(value)));
		} else {
			callback = resolve => (forecast[api]((err, value) => resolve(value)));
		}
		cache[api] = new Promise(callback);
	}

	return resolve(cache[api]);
});
