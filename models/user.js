/*jslint node: true */

'use strict';

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    twitter_id: {
        type: Number,
        index: true
    },
    twitter_handle: {
        type: String,
        index: true
    },
    twitter_name: String,
    tokens: {
        token: String,
        secret: String
    }
});

UserSchema.statics.findByTwitterId = function (id, done) {
    this.findOne({
        twitter_id: id
    }, done);
};

var User = mongoose.model('User', UserSchema);

module.exports = User;
