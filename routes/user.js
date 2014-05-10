/*jslint node: true */

'use strict';

var express = require('express');

var isAuthenticated = require('../lib/auth');

var routes = express.Router();

var tweetHelper = require('../lib/tweets');

var Progress = require('../models/progress'),
    Stat = require('../models/stat');

routes.get('/', isAuthenticated, function (req, res) {
    if (req.query.username) {
        return res.redirect('/u/' + req.query.username);
    }

    res.redirect('/');
});

routes.get('/:username', isAuthenticated, function (req, res) {
    res.render('start', {
        user: req.user,
        username: req.params.username
    });
});

routes.get('/start/:username', isAuthenticated, function (req, res) {
    Progress.findOne({
        twitter_handle: req.params.username,
        owner_id: req.user._id
    }, function (err, progress) {
        console.log('Got start request from', req.user.twitter_handle, 'for', req.params.username);

        if (!progress) {
            console.log('Has not already requested this user, creating progress object');
            progress = new Progress({
                twitter_handle: req.params.username,
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

            tweetHelper.getAllTweets(req.twit, req.params.username, function (count) {
                Progress.findOne({
                    twitter_handle: req.params.username,
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
            });
        });
    });
});

routes.get('/status/:username', isAuthenticated, function (req, res) {
    Progress.findOne({
        owner_id: req.user._id,
        twitter_handle: req.params.username
    }, function (err, progress) {
        if (err) {
            return res.json(err);
        }

        res.json(progress);
    });
});

module.exports = routes;
