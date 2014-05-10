/*jslint node: true */

'use strict';

var mongoose = require('mongoose');

var ProgressSchema = new mongoose.Schema({
    twitter_handle: String,
    owner_id: mongoose.Schema.ObjectId,
    gotten: Number,
    contains: Number,
    loading: Boolean,
    error: Boolean
});

var Progress = mongoose.model('Progress', ProgressSchema);

module.exports = Progress;
