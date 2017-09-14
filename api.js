let cache = {};

module.exports = forecast => api => {

	let fetch = forecast._request.bind(forecast);

	if (!cache[api]) {

		cache[api] = new Promise((resolve, reject) => {
			fetch(`/${api}`, (err, value) => {
				if (err == null) {
					if (value.reason) {
						return reject(value);
					} else {
						return resolve(value);
					}
				} else {
					return reject([err, value]);
				}
			});
		});
	}

	return cache[api];
};
