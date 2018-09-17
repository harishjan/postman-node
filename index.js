var express = require('express');
var request = require('request');
var url = require('url');
var compression = require('compression');
var bodyParser = require('body-parser');

var port = (process.env.VCAP_APP_PORT || 3001);

var app = express();
app.use(compression());
app.use(express.static(__dirname + '/public'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function(req, res){
    res.render(__dirname + '/public/index.html', {});
});

app.all('/api/request', function(req, res) {
    var targetUrl = url.parse(req.headers['target-url']);

    // Remove headers we don't want shipped with the request
    delete req.headers['target-url'];
    delete req.headers['referer'];  // Support the sometimes wrongly spelled version
    delete req.headers['referrer'];
    delete req.headers['accept-encoding'];  // This can cause problems, since we don't handle gzip well

    // Transform some headers to match the request we're sending
    req.headers['host'] = targetUrl.host;

    var proxy = request({
        method: req.method,
        url: targetUrl,
        headers: req.headers,
        body: req.body
    }, function(err, resp, body) {

        if (err) {
            console.error('Request returned an error: ' + err);
            res.status(500).send(err);
            return;
        }

        for (var key in resp.headers) {
            if (!resp.headers.hasOwnProperty(key)) {
                continue;
            }
            res.setHeader(key, resp.headers[key]);
        }

        res.status(resp.statusCode).send(body);
    });

});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/postmanroutes'); //importing route
routes(app); //register the route


app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(port);
console.log('Postman backend now running on port ' + port);
