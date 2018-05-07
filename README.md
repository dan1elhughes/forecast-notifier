# Forecast Notifier

Sends notifications for your bookings in Harvest Forecast

## Installation

* Create a personal access token at https://id.getharvest.com/developers

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

* Click the deploy button above
* Fill out the environment fields and click Deploy
* Click Manage app, and select "Heroku Scheduler" under "Installed add-ons"
* Add a new job "`worker`" for the time you want to be notified and click Save
