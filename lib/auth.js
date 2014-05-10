/*jslint node: true */

'use strict';

var Twit = require('twit');

var config = require('../config.json');

// middleware to check for user authentication
var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        req.twit = new Twit({
            consumer_key: config.twitter.consumer_key,
            consumer_secret: config.twitter.consumer_secret,
            access_token: req.user.tokens.token,
            access_token_secret: req.user.tokens.secret
        });

        return next();
    }

    res.redirect('/auth');
};

module.exports = ensureAuthenticated;
