/*jslint node: true */

'use strict';

var mongoose = require('mongoose');
var user = require('../models/user');
var users = require('../lib/users');

var assert = require('assert');

mongoose.connect('mongodb://localhost/3test');

describe('Users', function () {
    it('register new user', function (done) {
        users.findOrCreate({
            profile: {
                id: 457415010,
                username: 'Syfaro',
                display_name: 'Syfaro'
            },
            token: '',
            tokenSecret: ''
        }, done);
    });

    var mongoID;

    it('log into existing user', function (done) {
        users.findOrCreate({
            profile: {
                id: 457415010,
                username: 'Syfaro',
                display_name: 'Syfaro'
            },
            token: '',
            tokenSecret: ''
        }, function (err, item) {
            if (err) {
                return done(err);
            }

            if (!item) {
                return done(new Error('User not found'));
            }

            mongoID = user._id;

            user.count({
                twitter_handle: 'Syfaro'
            }, function (err, count) {
                assert.equal(1, count);
                done();
            });
        });
    });

    it('get a user from Twitter ID', function (done) {
        user.findByTwitterId(457415010, done);
    });

    it('get a user by ID', function (done) {
        user.findById(mongoID, done);
    });

    after(function (done) {
        user.remove(done);
    });
});
