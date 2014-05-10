/*jslint node: true */

'use strict';

var express = require('express');

var isAuthenticated = require('../lib/auth');

var routes = express.Router();

routes.get('/', function (req, res) {
    res.render('home');
});

routes.get('/3', isAuthenticated, function (req, res) {
    //TODO: main app handling
});

routes.get('/status', isAuthenticated, function (req, res) {
    //TODO: get progress
});

routes.get('/logout', isAuthenticated, function (req, res) {
    //TODO: log out
});

module.exports = routes;
