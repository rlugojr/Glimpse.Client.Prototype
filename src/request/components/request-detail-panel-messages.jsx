'use strict';

var _ = require('lodash');
var React = require('react');
var PanelGeneric = require('./request-detail-panel-generic');

module.exports = React.createClass({
    render: function () {    
	   var payload = _.values(this.props.data.payload).sort(function(a, b) { return a.ordinal - b.ordinal; });
	
        return (
            <div>
                <div><h3>Message Count - {payload.length}</h3></div>
                <table> 
                    <tbody>
                    {payload.map(function(item) { 
                        var payload = item.payload && !_.isEmpty(item.payload) ? <PanelGeneric payload={item.payload} /> : '--';
                        return (
                            <tr className="row-devider">
                                <td>
                                    <h2>{item.types.join(', ')} ({item.ordinal})</h2>
                                    <h3>Payload</h3>
                                    <div>{payload}</div> 
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        );
    }
});


// TODO: Need to come up with a better self registration process
(function () {
    var requestTabController = require('../request-tab');

    requestTabController.registerTab({
        key: 'tab.messages',
        title: 'Messages',
        component: module.exports
    });
})()
