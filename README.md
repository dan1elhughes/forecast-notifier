# Forecast Notifier

Sends notifications for your bookings in Harvest Forecast

## Installation

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

- Click the deploy button above
- Fill out the environment fields and click Deploy
	- The easiest way to determine your account ID and authorization token is by logging in to Forecast and using the web inspector Network tab to see one of the request(s) being made. Observe a request and note the authorization from the request header.
	- FORECAST_ACCOUNT_ID is the value of `forecastapp.com/<ACCOUNT_ID>/schedule/...`
	- FORECAST_AUTHORIZATION is called 'authorization' in the network tab
- Click Manage app, and select "Heroku Scheduler" under "Installed add-ons"
- Add a new job "`worker`" for the time you want to be notified and click Save
