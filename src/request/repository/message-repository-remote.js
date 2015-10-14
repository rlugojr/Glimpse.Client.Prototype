'use strict';

var request = require('superagent');
var glimpse = require('glimpse');
var metadataRepository = require('../../shell/repository/metadata-repository');

var uriTemplates = require("uri-templates");

module.exports = {
    triggerGetLastestSummaries: function() {
        metadataRepository.registerListener(function(metadata){
            var uri = metadata.resources["message-history"]
                .fill({
                    hash: metadata.hash
                });
            
            request
                .get(uri) 
                .set('Accept', 'application/json')
                .end(function(err, res){ 
                    // this is done because we want to delay the response
                    if (!FAKE_SERVER) {
                        if (res.ok) {
                            glimpse.emit('data.message.summary.found.remote', res.body);
                        }
                        else {
                            console.log('ERROR: Error reaching server for summary request')
                        }  
                    }
                }); 
        });
    },
    triggerGetDetailsFor: function(requestId) {
        metadataRepository.registerListener(function(metadata){
        var uri = metadata.resources["request"]
            .fill({
                hash: metadata.hash,
                requestId: requestId
            });

        request
            .get(uri) 
            .set('Accept', 'application/json')
            .end(function(err, res){ 
                // this is done because we want to delay the response
                if (!FAKE_SERVER) {
                    if (res.ok) {
                        glimpse.emit('data.message.summary.found.remote', res.body);
                    }
                    else {
                        console.log('ERROR: Error reaching server for summary request')
                    }  
                }
            }); 
        });
    }
};
