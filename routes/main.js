/*jslint node: true */

'use strict';

var express = require('express');

var isAuthenticated = require('../lib/auth');

var routes = express.Router();

var tweets = require('../lib/tweets');

routes.get('/', function (req, res) {
    res.render('home');
});

routes.get('/3', isAuthenticated, function (req, res) {
    res.render('start', {
        user: req.user
    });
});

routes.get('/start', isAuthenticated, function (req, res) {
    req.session.twits = {
        complete: false,
        status: 'Starting'
    };

    req.session.save();

    res.json(req.session.twits);

    tweets.getAllTweets(req.twit, req.user.twitter_handle, function (count) {
        req.session.twits.status = 'Loading';
        req.session.twits.count = count;

        req.session.save();
    }, function (err, tweets) {
        var stats = tweets.handleTweets(tweets);

        req.session.twits = {
            complete: true,
            status: 'Done!',
            stats: stats
        };

        req.session.save();
    });
});

routes.get('/status', isAuthenticated, function (req, res) {
    res.json(req.session.twits);
});

routes.get('/logout', isAuthenticated, function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = routes;
