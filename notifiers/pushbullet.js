/* eslint-disable no-console */

const request = require('request');

const endpoint = s => `https://api.pushbullet.com/v2${s}`;

module.exports = apiKey => ({ title, body }) => new Promise((resolve, reject) => {

	const headers = { 'Access-Token': apiKey };
	const url = endpoint('/pushes');
	const type = 'note';
	const form = { type, title, body };

	request.post({ headers, url, form }, (err, response, body) => {
		if (response.statusCode === 200) {
			return resolve('Send notification through Pushbullet');
		} else {
			return reject(['pushbullet', err, body]);
		}
	});
});
