/*jslint node: true */

'use strict';

var mongoose = require('mongoose');

var StatSchema = new mongoose.Schema({

});

var Stat = mongoose.model('Stat', StatSchema);

module.exports = Stat;
