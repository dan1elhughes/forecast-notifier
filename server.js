const http = require('http');
const port = process.env.PORT || 8080;

http
	.createServer((req, res) => {
		res.writeHead(301, {
			Location: 'https://github.com/dan1elhughes/forecast-notifier',
		});
		res.end();
	})
	.listen(port, () => console.log(`Listening on ${port}`));
