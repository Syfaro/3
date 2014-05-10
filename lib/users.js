/*jslint node: true */

'use strict';

function Users(storage) {
    this.storage = storage;
}

Users.prototype.findById = function (id, done) {
    //TODO: handle getting a user by ID
};

Users.prototype.findOrCreate = function (data, done) {
    //TODO: handle finding or creating user
};

module.exports = Users;
