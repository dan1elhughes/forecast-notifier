/* eslint-disable no-console */

const request = require('request');
const dateformat = require('dateformat');

const format = date => dateformat(date, 'mmmm dS');
const endpoint = s => `https://api.pushbullet.com/v2${s}`;

const toReadableDate = (a, b) => a === b ? '' : `until ${format(b)}`;
const toReadableTags = tags => tags.length ? `(${tags.join(', ')})` : '';

module.exports = apiKey => projects => new Promise((resolve, reject) => {

	const headers = { 'Access-Token': apiKey };

	const url = endpoint('/pushes');

	const type = 'note';
	const title = 'Today\'s projects';
	const body = projects.map(_ => `${_.name} ${toReadableDate(_.start, _.end)} ${toReadableTags(_.tags)}`).join('\n');

	const form = { type, title, body };

	request.post({ headers, url, form }, (err, response, body) => {
		if (response.statusCode === 200) {
			console.log('Sent notification');
			return resolve();
		} else {
			return reject(['pushbullet', err, body]);
		}
	});
});
