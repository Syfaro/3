/*jslint node: true */

'use strict';

var getAllTweets = function (T, name, update, done) {
    var data = [],
        getBlock,
        onTimeline;

    getBlock = function (lastId) {
        var args = {
            screen_name: name,
            count: 200,
            max_id: lastId
        };

        update(data.length);

        onTimeline = function (err, chunk) {
            if (err) {
                return done(err);
            }

            if (data.length) {
                chunk.shift();
            }

            data = data.concat(chunk);

            var thisId = parseInt(data[data.length - 1].id_str, 10);

            if (chunk.length) {
                return getBlock(thisId);
            }

            return done(null, data);
        };

        T.get('statuses/user_timeline', args, onTimeline);
    };

    getBlock();
};

var handleTweets = function (tweets) {
    var count = 0,
        i = 0,
        response;

    for (i = 0; i < tweets.length; i += 1) {
        if (tweets[i].text.indexOf(':3') !== -1) {
            count += 1;
        }
    }

    return {
        count: count,
        total: tweets.length
    };
};

module.exports = {
    getAllTweets: getAllTweets,
    handleTweets: handleTweets
};
