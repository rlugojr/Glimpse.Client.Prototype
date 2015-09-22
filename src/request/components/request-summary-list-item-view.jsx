'use strict';

var glimpse = require('glimpse');
var messageProcessor = require('../util/request-message-processor.js');

var React = require('react');
var Timeago = require('lib/components/timeago');
var classNames = require('classnames');

function getSummaryPayloads(request) {
    var processItem = messageProcessor.getTypeMessageItem;
    
    var options = {
        'user-identification': processItem,
        'end-request-message': processItem,
        'begin-request-message': processItem
    };
    
    return messageProcessor.getTypeMessages(request, options); 
}

module.exports = React.createClass({
    render: function () {
        var request = this.props.request;
        
        var containerClass = classNames({
            'request-summary-item-holder': true,
            'request-summary-shell-selected': request._selected
        });
        
        var payload = getSummaryPayloads(request);
        var user = payload.userIdentification;
        var beginRequest = payload.beginRequestMessage;
        var endRequest = payload.endRequestMessage;
        var abstract = {};
        
        return (
            <div className={containerClass} onClick={this.onSelect}>
                <table className="table table-bordered">
                    <tr>
                        <td width="90">{request.duration}ms</td>
                        <td colSpan="6">
                            {beginRequest.url} &nbsp; {endRequest.method} &nbsp; {endRequest.statusCode} ({endRequest.statusText}) - {endRequest.contentType}
                        </td>
                        <td><Timeago time={request.dateTime} /></td>
                    </tr>
                    <tr>
                        <td>{user.username}</td>
                        <td>{abstract.networkTime}ms</td>
                        <td>{abstract.serverTime}ms</td>
                        <td>{abstract.clientTime}ms</td>
                        <td>{abstract.controller}.{abstract.action}(...)</td>
                        <td>{abstract.actionTime}ms</td>
                        <td>{abstract.viewTime}ms</td>
                        <td>{abstract.queryTime}ms / {abstract.queryCount}</td>
                    </tr>
                </table>
            </div>
        );
    },
    onSelect: function () {
        glimpse.emit('shell.request.summary.selected', { requestId: this.props.request.id });
    }
});
