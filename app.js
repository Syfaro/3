/*jslint node: true */

'use strict';

// express and middleware
var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    morgan = require('morgan');

// express sessions and auth
var passport = require('passport'),
    TwitterStrategy = require('passport-twitter'),
    session = require('express-session'),
    RedisStore = require('connect-redis')(session);

// twitter
var Twit = require('twit');

// app functions
var users = require('./lib/users'),
    stats = require('./lib/stats'),
    tweets = require('./lib/tweets');

// database
var mongoose = require('mongoose');

// express app
var app = express();

// set up database
mongoose.connect('mongodb://localhost/3');

// use redis or fakeredis, depending on envronment
var client;
if (process.env.NODE_ENV === 'production') {
    console.log('Using Redis');
    client = require('redis').createClient();
} else {
    console.log('Using fake Redis');
    client = require('fakeredis').createClient();
}

// load config
var config = require('./config.json');

// set up express
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.enable('trust proxy');

// express middleware
app.use(morgan('short'));
app.use(cookieParser());
app.use(bodyParser());
app.use(session({
    secret: config.sessions.secret,
    store: new RedisStore({
        client: client
    })
}));
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use(require('./routes/main'));
app.use('/u', require('./routes/user'));

// passport config
passport.use(new TwitterStrategy({
    consumerKey: config.twitter.consumer_key,
    consumerSecret: config.twitter.consumer_secret,
    callbackURL: config.twitter.callback
}, function (token, tokenSecret, profile, done) {
    users.findOrCreate({
        profile: profile,
        token: token,
        tokenSecret: tokenSecret
    }, done);
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    //TODO: handle getting user by session token
});

app.get('/auth', passport.authenticate('twitter'));
app.get('/auth/callback', passport.authenticate('twitter', {
    successRedirect: '/3',
    failureRedirect: '/auth'
}));

app.listen(config.express.port, function () {
    console.log('Started 3 on ' + config.express.port);
});
