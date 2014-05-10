/*jslint node: true */

'use strict';

var User = require('../models/user');

var Users = {};

Users.findById = function (id, done) {
    User.findById(id, function (err, user) {
        console.log(err, user);
    });
};

Users.findOrCreate = function (data, done) {
    User.findByTwitterId(data.profile.id, function (err, user) {
        if (err) {
            return done(err);
        }

        if (user === null) {
            user = new User({
                twitter_id: data.profile.id,
                twitter_handle: data.profile.username,
                twitter_name: data.profile.display_name,
                tokens: {
                    token: data.token,
                    secret: data.tokenSecret
                }
            });

            user.save();

            done (null, user);
        } else {
            user.tokens.token = data.token;
            user.tokens.secret = data.tokenSecret;
            user.twitter_name = data.profile.display_name;

            user.save(function () {
                done(null, user);
            });
        }
    });
};

module.exports = Users;
