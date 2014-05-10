/*jslint node: true */

'use strict';

var mongoose = require('mongoose');

var StatSchema = new mongoose.Schema({
    twitter_handle: String,
    total_tweets: Number,
    contains: Number
});

StatSchema.virtual('percent').get(function () {
    return this.contains / this.total_tweets;
});

var Stat = mongoose.model('Stat', StatSchema);

module.exports = Stat;
