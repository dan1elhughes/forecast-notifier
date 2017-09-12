/* eslint-disable no-console */

const request = require('request');
const dateformat = require('dateformat');

const format = date => dateformat(date, 'mmmm dS');
const endpoint = s => `https://api.pushbullet.com/v2${s}`;

module.exports = apiKey => projects => {
	const headers = { 'Access-Token': apiKey };

	const url = endpoint('/pushes');

	const type = 'note';
	const title = 'Today\'s projects';
	const body = projects.map(_ => `${_.name} (${format(_.start)} to ${format(_.end)})`).join('\n');

	const form = { type, title, body };

	request.post({ headers, url, form }, (err, response, body) => {
		if (response.statusCode === 200) {
			console.log('Sent notification');
			process.exit(0);
		} else {
			console.error(err);
			console.error(body);
			process.exit(1);
		}
	});
};
