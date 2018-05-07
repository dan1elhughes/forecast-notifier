/* eslint-disable no-console */
/* global process */

const assert = require('assert');
const Forecast = require('forecast-promise');
const format = require('./formatter');
const pipe = require('./pipe');
const dateRangeCovers = require('./dateRangeCovers');

const map = fn => arr => arr.map(fn);
const filter = fn => arr => arr.filter(fn);

require('dotenv').config();

const { FORECAST_ACCOUNT_ID, FORECAST_TOKEN, TELEGRAM_CONFIG } = process.env;

// Load environment variables
assert(
	FORECAST_ACCOUNT_ID,
	'FORECAST_ACCOUNT_ID environment variable is unset'
);
assert(FORECAST_TOKEN, 'FORECAST_TOKEN environment variable is unset');
const accountId = FORECAST_ACCOUNT_ID.trim();
const token = FORECAST_TOKEN.trim();

const telegramKey = TELEGRAM_CONFIG;
const output = require('./notifiers/telegram')(telegramKey.trim());

// Connect API to Forecast
const fc = new Forecast({ accountId, token });

const getID = async () => {
	console.log('Finding ID from API token...');
	const { id } = await fc.whoAmI();

	console.log(`Found ID ${id}`);
	return id;
};

// Converts a user ID to a list of assignments
const getAssignmentsForID = async id => {
	console.log(`Finding assignments for user ${id}...`);
	const assignments = await fc.assignments();

	console.log('Filtering list of assignments...');
	const myAssignments = assignments.filter(_ => _.person_id === id);

	console.log(`Got assignments: ${myAssignments.map(_ => _.id).join(', ')}`);
	return myAssignments;
};

// Appends a name field and tags field to an assignment
const addProjectNameToAssignment = async assignment => {
	console.log(`Finding name of project ${assignment.project_id}...`);

	const projects = await fc.projects();

	const project = projects.find(_ => _.id === assignment.project_id);

	assignment.name = project.name;
	assignment.tags = project.tags;

	console.log(`Found name ${assignment.name}`);

	return assignment;
};

// Iterates the above function and wraps in a Promise collection
const addNamesToAssignments = ids =>
	Promise.all(ids.map(addProjectNameToAssignment));

const addDatesToAssignment = assignment => ({
	...assignment,
	start: new Date(Date.parse(assignment.start_date)),
	end: new Date(Date.parse(assignment.end_date)),
});

const convertToReadableFormat = assignments =>
	assignments.map(_ => ({
		name: _.name,
		start: _.start_date,
		end: _.end_date,
		tags: _.tags,
	}));

const reverse = arr => arr.reverse();

// All ready, let's go!
const app = pipe([
	getID,
	getAssignmentsForID,
	map(addDatesToAssignment),
	filter(dateRangeCovers(new Date())),
	addNamesToAssignments,
	convertToReadableFormat,
	reverse,
	format,
	output,
]);

app()
	.then(msg => console.log(msg))
	.catch(err => {
		console.error(err);

		const title = 'Forecast API error';
		const body = JSON.stringify(err);

		// output({ title, body }).then(() => process.exit(1));
	});
