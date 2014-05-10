/*jslint node: true */

'use strict';

var express = require('express');

var isAuthenticated = require('../lib/auth');

var routes = express.Router();

var tweetHelper = require('../lib/tweets');

var Progress = require('../models/progress'),
    Stat = require('../models/stat');

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
    Progress.findOne({
        twitter_handle: req.user.twitter_handle,
        owner_id: req.user._id
    }, function (err, progress) {
        console.log('Got start request from ' + req.user.twitter_handle);

        if (!progress) {
            console.log('Has not already requested this user, creating progress object');
            progress = new Progress({
                twitter_handle: req.user.twitter_handle,
                loading: true,
                owner_id: req.user._id
            });
        } else if (progress.loading === true) {
            console.log('Already requesting this user');
            res.json('Started');
            return;
        } else {
            console.log('Already requested, but stale information');
            progress.loading = true;
        }

        progress.save(function (err) {
            if (err) {
                console.error(err);
                return;
            }

            res.json('Started');

            tweetHelper.getAllTweets(req.twit, req.user.twitter_handle, function (count) {
                Progress.findOne({
                    twitter_handle: req.user.twitter_handle,
                    owner_id: req.user._id
                }, function (err, progress) {
                    progress.gotten = count;

                    progress.save();
                });
            }, function (err, tweets) {
                if (err) {
                    return console.error(err);
                }

                var stats = tweetHelper.handleTweets(tweets);

                progress.gotten = stats.total;
                progress.contains = stats.count;
                progress.loading = false;

                progress.save();

                Stat.findOne({
                    twitter_handle: req.user.twitter_handle
                }, function (err, stat) {
                    if (!stat) {
                        new Stat({
                            twitter_handle: req.user.twitter_handle,
                            total_tweets: stats.total,
                            contains: stats.count
                        }).save();
                    } else {
                        stat.total_tweets = stats.total;
                        stat.contains = stats.count;

                        stat.save();
                    }
                });
            });
        });
    });
});

routes.get('/status', isAuthenticated, function (req, res) {
    Progress.findOne({
        owner_id: req.user._id,
        twitter_handle: req.user.twitter_handle
    }, function (err, progress) {
        if (err) {
            return res.json(err);
        }

        res.json(progress);
    });
});

routes.get('/leaderboard', function (req, res) {
    Stat.find(function (err, stats) {
        stats.sort(function (a, b) {
            return b.percent - a.percent;
        });

        res.render('leaderboard', {
            stats: stats
        });
    });
});

routes.get('/logout', isAuthenticated, function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = routes;
