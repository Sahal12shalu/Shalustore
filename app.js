var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var handlebars = require('handlebars');
var expressHandlebars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

var indexRouter = require('./routes/user');
var usersRouter = require('./routes/admin');

var fileUpload = require('express-fileupload');
var db = require('./config/connection');
const { stringify } = require('querystring');
var session = require('express-session')

var app = express();

// Set up Handlebars
const hbs = expressHandlebars.create({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname, 'views/layout'),
    partialsDir: path.join(__dirname, 'views/nav'),
    handlebars: allowInsecurePrototypeAccess(handlebars),
    helpers: {
        stringifySizes: function (sizes) {
            return JSON.stringify(sizes);
        },
        eq: function (a, b) {
            return a === b;
        }
    }
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({secret:"key"}))

db.connect();

app.use('/', indexRouter);
app.use('/admin', usersRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;