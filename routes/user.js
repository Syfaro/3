/*jslint node: true */

'use strict';

var express = require('express');

var routes = express.Router();

routes.get('/:username', function (req, res) {
    //TODO: load data for username
});

module.exports = routes;
