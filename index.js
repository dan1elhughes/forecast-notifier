/* eslint-disable no-console */

const assert = require('assert');
const Forecast = require('forecast-api');
const api = require('./api');
const pipe = require('./pipe');
require('dotenv').config();

// Load environment variables
assert(process.env.FORECAST_ACCOUNT_ID, 'FORECAST_ACCOUNT_ID environment variable is unset');
assert(process.env.FORECAST_AUTHORIZATION, 'FORECAST_AUTHORIZATION environment variable is unset');
assert(process.env.EMAIL, 'EMAIL environment variable is unset');
const accountId = process.env.FORECAST_ACCOUNT_ID;
const authorization = process.env.FORECAST_AUTHORIZATION;
const email = process.env.EMAIL;

// Configure output handler, default to console if pushbullet not configured
const apiKey = process.env.PUSHBULLET_API_KEY;
let output = apiKey ? require('./pushbullet')(apiKey) : console.log.bind(console);

// Connect API to Forecast
const forecast = new Forecast({ accountId, authorization });
const load = api(forecast);

// Converts an email address to an internal ID
const getIDFromEmail = email => new Promise(resolve => {

	console.log(`Finding ID of user ${email}...`);

	load('people').then(people => {
		const { id } = people.find(_ => _.email === email);
		console.log(`Found ID: ${id}`);
		return resolve(id);
	});
});

// Converts a user ID to a list of assignments
const getAssignmentsForID = options => id => new Promise(resolve => {

	console.log(`Finding assignments for user ${id}...`);

	load('assignments', options).then(assignments => {
		console.log('Filtering list of assignments...');

		const myAssignments = assignments.filter(_ => _.person_id === id);

		console.log(`Got assignments: ${myAssignments.map(_ => _.id).join(', ')}`);

		return resolve(myAssignments);
	});
});

// Appends a name field and tags field to an assignment
const addProjectNameToAssignment = assignment => new Promise(resolve => {
	console.log(`Finding name of project ${assignment.project_id}...`);
	load('projects').then(projects => {

		const project = projects.find(_ => _.id === assignment.project_id);

		assignment.name = project.name;
		assignment.tags = project.tags;

		console.log(`Found name ${assignment.name}`);

		return resolve(assignment);
	});
});

// Iterates the above function and wraps in a Promise collection
const addNamesToAssignments = ids => Promise.all(ids.map(addProjectNameToAssignment));

const convertToReadableFormat = assignments => assignments.map(_ => ({
	name: _.name,
	start: _.start_date,
	end: _.end_date,
	tags: _.tags.join(', '),
}));

// Configures the date range to be queried
const startDate = new Date();
const rangeInDays = 0;
let endDate = new Date();
endDate.setDate(endDate.getDate() + rangeInDays);
let options = { startDate, endDate };

// All ready, let's go!
const app = pipe([
	getIDFromEmail,
	getAssignmentsForID(options),
	addNamesToAssignments,
	convertToReadableFormat,
	output,
]);

app(email);
