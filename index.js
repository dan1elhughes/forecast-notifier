/* eslint-disable no-console */

const assert = require('assert');
const Forecast = require('forecast-api');
const api = require('./api');
const pipe = require('./pipe');
const dateRangeCovers = require('./dateRangeCovers');

const map = fn => arr => arr.map(fn);
const filter = predicate => arr => arr.filter(predicate);

require('dotenv').config();

// Load environment variables
assert(process.env.FORECAST_ACCOUNT_ID, 'FORECAST_ACCOUNT_ID environment variable is unset');
assert(process.env.FORECAST_AUTHORIZATION, 'FORECAST_AUTHORIZATION environment variable is unset');
const accountId = process.env.FORECAST_ACCOUNT_ID.trim();
const authorization = process.env.FORECAST_AUTHORIZATION.trim();

// Configure output handler, default to console if pushbullet not configured
const apiKey = process.env.PUSHBULLET_API_KEY;
let output = apiKey ? require('./pushbullet')(apiKey.trim()) : console.log.bind(console);

// Connect API to Forecast
const forecast = new Forecast({ accountId, authorization });
const load = api(forecast);

const getID = () => {
	console.log('Finding ID from API token...');
	return load('whoami').then(({ current_user }) => {
		let { id } = current_user;
		console.log(`Found ID ${id}`);
		return id;
	});
};

// Converts a user ID to a list of assignments
const getAssignmentsForID = id => {

	console.log(`Finding assignments for user ${id}...`);

	return load('assignments').then(({ assignments }) => {
		console.log('Filtering list of assignments...');

		const myAssignments = assignments.filter(_ => _.person_id === id);

		console.log(`Got assignments: ${myAssignments.map(_ => _.id).join(', ')}`);

		return myAssignments;
	});
};

// Appends a name field and tags field to an assignment
const addProjectNameToAssignment = assignment => {
	console.log(`Finding name of project ${assignment.project_id}...`);
	return load('projects').then(({ projects }) => {

		const project = projects.find(_ => _.id === assignment.project_id);

		assignment.name = project.name;
		assignment.tags = project.tags;

		console.log(`Found name ${assignment.name}`);

		return assignment;
	});
};

// Iterates the above function and wraps in a Promise collection
const addNamesToAssignments = ids => Promise.all(ids.map(addProjectNameToAssignment));

const addDatesToAssignment = assignment => {
	assignment.start = new Date(Date.parse(assignment.start_date));
	assignment.end = new Date(Date.parse(assignment.end_date));
	return assignment;
};

const convertToReadableFormat = assignments => assignments.map(_ => ({
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
	output,
]);

app().catch(err => {
	console.log(err);
	process.exit(1);
});
