'use strict';

var glimpse = require('glimpse');
var chance = require('./fake-extension'); // TODO: Can I just import chance and have this wired up differently
var cache = {
    summary: {},
    details: {}
};

var triggerGetLastestSummaries = (function () {
    var moment = require('moment');
    var fakeSummary = require('./fake-request-summary');
    var maxEvents = chance.integerRange(25, 35);
    var numLocal = maxEvents * 0.25;
    var numRemote = maxEvents * 0.3;

    var batch = (function() {
        var calculateOffset = function(seconds) {
            var date = new Date();
            var value = seconds * 1000;

            return moment(date.setTime(date.getTime() + value)).toISOString();
        }

        var generateMessages = function(num, event, dateTimeOffet) {
            var results = [];
            for (var i = 0; i < num; i++) {
                dateTimeOffet -= chance.integerRange(30, 300);

                var dateTime = calculateOffset(dateTimeOffet);
                var result = fakeSummary.generate(dateTime);

                results.push(result);
            }

            return results;
        }
        var cacheMessages = function(requests) {
            for (var i = 0; i < requests.length; i++) {
                var request = requests[i];

                cache.summary[request.context.id] = request;
            }
        };
        var publishMessages = function(event, requests) {
            var messages = [];
            for (var i = 0; i < requests.length; i++) {
                Array.prototype.push.apply(messages, requests[i].messages);
            }

            glimpse.emit('data.message.summary.found.' + event, messages);
        }

        return function(num, event, dateTimeOffet) {
            console.log('[fake] ' + event + ' - ' + parseInt(num));

            var results = generateMessages(num, event, dateTimeOffet);
            cacheMessages(results);
            publishMessages(event, results);
        }
    })();

    var generate = {
        local: function () {
            // simulate requests happening more than a day ago
            batch(numLocal, 'local', 25 * 60 * 60 * -1);
        },
        remote: function () {
            // simulate requests happeing more than 10 seconds ago
            batch(numRemote, 'remote', 10 * -1);
        },
        stream: function (position) {
            // simulate requests happeing more every interval
            console.log('[fake] stream - ' + position + ' of ' + maxEvents);

            // TODO: Update so that array occasionally puts out 2 vs the norm of 1 result
            requestsFound('message', [ fakeSummary.generate() ]);

            setTimeout(function () {
                if (position < maxEvents) {
                    generate.stream(++position);
                }
            }, chance.integerRange(500, 15000));
        }
    };

    return function () {
        // simulate messages from local store
        setTimeout(function () {
            generate.local();
        }, chance.integerRange(50, 100));

        // simulate messages from remote
        setTimeout(function () {
            generate.remote();
        }, chance.integerRange(2000, 2500));

        // simulate messages from stream
        setTimeout(function () {
            generate.stream(0);
        }, chance.integerRange(4000, 6000));
    };
})();

// simulate details
var triggerGetDetailsFor = (function () {
    var fakeDetail = require('./fake-request-detail');

    function requestsFound(event, request) {
        glimpse.emit('data.request.detail.found.' + event, request);
    }

    var generate = {
        local: function (id) {
            if (cache.details[id]) {
                requestsFound('local', cache.details[id]);
            }
        },
        message: function (id) {
            var request = cache.details[id];
            if (!request) {
                request = fakeDetail.generate(cache.summary[id]);

                cache.details[id] = request;
            }

            // TODO: Check if this needs to happen given the local logic above
            requestsFound('message', request);
        }
    };

    return function (id) {
        // simulate messages from local store
        setTimeout(function () {
            generate.local(id);
        }, chance.integerRange(10, 50));

        // simulate messages from remote
        setTimeout(function () {
            generate.message(id);
        }, chance.integerRange(2000, 3000));
    };
})();

(function () {
    function requestReady() {
        triggerGetLastestSummaries();
    }

    glimpse.on('shell.request.ready', requestReady);
})();

(function () {
    function detailRequested(payload) {
        triggerGetDetailsFor(payload.requestId);
    }

    glimpse.on('data.request.detail.requested', detailRequested);
})();
