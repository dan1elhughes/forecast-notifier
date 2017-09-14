const request = require('request');

const endpoint = token => `https://api.telegram.org/bot${token}/sendMessage`;

module.exports = config => content => new Promise(function(resolve, reject) {
	const [ chat_id, token ] = config.split('|');

	const text = `${content.title}\n\n${content.body}`;

	const url = endpoint(token);

	const qs = {
		chat_id,
		text,
	};

	request({ url, qs }, (err, response, body) => {
		if (response.statusCode === 200) {
			return resolve('Send notification through Telegram');
		} else {
			return reject(['telegram', err, body]);
		}
	});
});
