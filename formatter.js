const dateformat = require('dateformat');

const format = date => dateformat(date, 'mmmm dS');

const toReadableDate = (a, b) => a === b ? '' : `until ${format(b)}`;
const toReadableTags = tags => tags.length ? `(${tags.join(', ')})` : '';

module.exports = projects => ({
	title: 'Today\'s projects',
	body: projects.map(_ => `${_.name} ${toReadableDate(_.start, _.end)} ${toReadableTags(_.tags)}`).join('\n'),
});
