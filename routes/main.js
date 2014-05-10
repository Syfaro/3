/*jslint node: true */

'use strict';

var express = require('express');

var isAuthenticated = require('../lib/auth');

var routes = express.Router();

var tweetHelper = require('../lib/tweets');

var Progress = require('../models/progress');

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
    res.json('Started');

    Progress.findOne({
        twitter_handle: req.user.twitter_handle,
        owner_id: req.user._id
    }, function (err, progress) {
        if (!progress) {
            progress = new Progress({
                twitter_handle: req.user.twitter_handle,
                loading: true,
                owner_id: req.user._id
            });
        } else {
            progress.loading = true;
        }

        progress.save(function (err) {
            if (err) {
                console.error(err);
                return;
            }

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

                Progress.findOne({
                    twitter_handle: req.user.twitter_handle,
                    owner_id: req.user._id
                }, function (err, progress) {
                    progress.gotten = stats.total;
                    progress.contains = stats.count;
                    progress.loading = false;

                    progress.save();
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

routes.get('/logout', isAuthenticated, function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = routes;
