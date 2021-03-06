var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  db.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

var index = require('./routes/index');
var play = require('./routes/play');
var users = require('./routes/users');
var howto = require('./routes/howto');
var scores = require('./routes/scores');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(session({
  secret: 'secretsecretIhavegotasecret',
  saveUninitialized: false,
  resave: false
}));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/play', play);
app.use('/users', users);
app.use('/howto', howto);
app.use('/hall-of-fame', scores);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.io = require('./sock');
module.exports = app;
