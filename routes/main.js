/*jslint node: true */

'use strict';

var express = require('express');

var isAuthenticated = require('../lib/auth');

var routes = express.Router();

var tweetHelper = require('../lib/tweets');

routes.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/3');
    }

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

    tweetHelper.getAllTweets(req.twit, req.user.twitter_handle, function (count) {
        req.session.twits = {
            complete: false,
            message: 'Loading!',
            count: count
        };

        req.session.save();
    }, function (err, tweets) {
        if (err) {
            console.error(err);
            req.session.twits = {
                complete: false,
                error: true,
                status: 'Error!'
            };
            return req.session.save();
        }

        var stats = tweetHelper.handleTweets(tweets);

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
