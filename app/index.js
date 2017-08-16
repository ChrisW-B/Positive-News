require('colors');
const config = require('./config'),
  sentiment = require('sentiment'),
  bodyParser = require('body-parser'),
  compression = require('compression'),
  express = require('express'),
  NewsApi = require('news-api-njs'),

  path = require('path'),
  winston = require('winston'),
  expressWinston = require('express-winston'),

  app = express(),
  news = new NewsApi({
    apiKey: config.apiKey
  });

const ONE_MIN = 60 * 1000,
  ONE_DAY = ONE_MIN * 60 * 24;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: ONE_DAY
}));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(compression());
app.use(expressWinston.logger({
  transports: [new winston.transports.Console({ 'timestamp': true, colorize: true })],
  expressFormat: true,
  meta: false,
  colorize: true
}));
app.get('/',
  function (req, res) {
    news.getSources({
      language: 'en',
      country: 'us'
    }).then(function (response) {
      res.render('pages/index', {
        sources: response.sources
      });
    }).catch(function (err) {
      winston.error(err);
    });
  });
app.get('/news',
  function (req, res) {
    winston.info(req.query.source);
    news.getArticles({
      source: req.query.source
    }).then(function (response) {
      response.articles.forEach(function (ele) {
        var text = [ele.title, ele.description].filter(function (val) {
          return val;
        }).join(' '); //avoid giving a null
        ele.score = sentiment(text).score / text.length;
      });
      response.articles.sort(function (a, b) {
        return b.score - a.score;
      });
      response.success = true;
      res.send(response);
    }).catch(function (err) {
      winston.error(err);
    });
  }
);
app.listen(3000, function () {
  winston.info('Positive-News listening on port 3000!\n'.rainbow + 'http://localhost:3000/');
});