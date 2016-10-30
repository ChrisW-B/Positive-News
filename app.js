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
app.set('views', __dirname + 'views');
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
		}).then(function(response) {
			res.render('pages/index', {
				sources: response.sources
			});
		}).catch(function(err) {
			console.log(err);
		});
	});
app.get('/news',
	function(req, res) {
		console.log(req.query.source);
		news.getArticles({
			source: req.query.source
		}).then(function(response) {
			response.articles.forEach(function(ele) {
				var text = [ele.title, ele.description].filter(function(val) {
					return val;
				}).join(' '); //avoid giving a null
				ele.score = sentiment(text).score / text.length;
			});
			response.articles.sort(function(a, b) {
				return b.score - a.score;
			});
			response.success = true;
			res.send(response);
		}).catch(function(err) {
			console.log(err);
		});
	}
);
app.listen(3000, function() {
	console.log('Positive-News listening on port 3000!');
});