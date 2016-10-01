var config = require('./config'),
	sentiment = require('sentiment'),
	bodyParser = require('body-parser'),
	request = require('request'),
	compression = require('compression'),
	scribe = require('scribe-js')(),
	express = require('express'),
	NewsApi = require('news-api-njs'),
	app = express(),
	news = new NewsApi({
		apiKey: config.apiKey
	});

const ONE_MIN = 60 * 1000,
	ONE_DAY = ONE_MIN * 60 * 24;



app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public", {
	maxAge: ONE_DAY
}));
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());
app.use(compression());
app.use(scribe.express.logger(console)); //Log each request
app.use('/logs', scribe.webPanel());
app.get('/',
	function(req, res) {
		news.getSources({
			language: 'en',
			country: 'us',
			callback(response) {
				res.render('pages/index', {
					sources: response.sources
				});
			}
		});
	});
app.get('/news',
	function(req, res) {
		console.log(req.query.source);
		news.getArticles({
			source: req.query.source,
			callback(response) {
				response.articles.forEach(function(ele) {
					ele.score = sentiment(ele.title).score + sentiment(ele.description).score + 20; //no negative scores
				});
				response.articles.sort(function(a, b) {
					return b.score - a.score;
				});
				res.send(response);
			}
		});
	}
);
app.listen(3000, function() {
	console.log('Positive-News listening on port 3000!');
});