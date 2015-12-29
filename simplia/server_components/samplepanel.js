/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * � 2010-2015 Lotus Interworks Inc. (�LIW�) Proprietary and Trade Secret.
 * Do not copy distribute or otherwise use without explicit written permission from B. Gopinath President.
 * Do not communicate or share the information contained herein with any one else except employees of LIW  on a need to know basis.
 * LIW values its intellectual properties and excepts all those who work with LIW to protect all work, including ideas, designs, processes,
 * software and documents shared or created in any engagement with LIW as proprietary to LIW.
 * This document may make references to open sourced software being considered or used by LIW.
 * Extensions, including modifications to such open source software are deemed proprietary and trade secret to LIW  until
 * and unless LIW formally and with explicit written consent contributes specific modified open source code back to open source.
 * In any event, including cases where modified open sourced components are placed in open source, the selection, interconnection,
 * configuration, processes, designs, implementation of all technology, including opens source software,
 * that is being developed or is part of LIW deployed systems are proprietary and trade secret to LIW and
 * such information shall not be shared with any one else except employees of LIW on a need to know basis.
 *
 */

var BasicServerComponent = require('./../lib/basicservercomponent');
var util = require('util');
var async = require('async');

function SamplePanel(params, callback) {
    //Calling base constructor
    BasicServerComponent.call(this, params, callback || undefined);
}

//Inheriting from the base object
util.inherits(SamplePanel, BasicServerComponent);

SamplePanel.prototype.init = function(mCallback) {
    var that = this;
    async.waterfall([
        function(callback) {
            BasicServerComponent.prototype.init.call(that, callback);
        }
    ], function(error){
        if(error) {
            console.log('registered account-init-error:', error);
        }
        if(typeof mCallback !== "undefined") {
            mCallback();
        }
    });
};

SamplePanel.prototype.handleRoute = function(req, res, next) {
    var commandHandler = {
        'openDynamodbViewer': this.openDynamodbViewer.bind(this, req, res),
        'setPanelPermission': this.addSimplePanelPermission.bind(this, req, res),
        'openSimplePanel': this.openSimplePanel.bind(this, req, res),
        'grantODE': this.grantODE.bind(this, req, res)
    };

    var data = (typeof req.body.data !== "undefined") ? (JSON.parse(req.body.data)) : {};
    commandHandler[data.command](data);
};

SamplePanel.prototype.createNewSampelPanel = function(req, res, data) {
    console.log("Inside Create New Sample Panel");
    var that = this;
    async.waterfall([
        this.getAccountItem.bind(this, data.accountName),
        function(accountItem, callback) {
            that.params.oxygenLib.getTemplate(that.params.config.get('config.nodeIds.templates.samplepanel.server'),
                function(error, templateItem){
                callback(error, accountItem, templateItem);
            });
        },
        function(accountItem, templateItem, callback) {
            that.params.globals.typeServers[templateItem.Type].createServerTip(
                templateItem.Node,
                {

                },
                {

                },
                function(error, tipItem) {
                    callback(error, accountItem, tipItem);
                }
            );

        },
        function(accountItem, ODEItem, callback) {
            that.params.globals.typeServers[that.serverTypeId].getLinkedThread(accountItem.Node, function(error, threadId) {
                callback(error, accountItem, ODEItem, threadId);
            });
        },
        function(accountItem, ODEItem, threadId, callback) {
            that.params.oxygenLib.getTip(threadId, function(error, threadItem){
                callback(error, accountItem, ODEItem, threadItem);
            });
        },
        function(accountItem, ODEItem, threadItem, callback) {
            var data = {
                id: ODEItem.Node,
                displayName: ODEItem.DisplayName,
                roleInObject: that.params.config.get('config.roles.developer'),
                roleInThread: that.params.config.get('config.roles.developer'),
                viewId: config.get('config.encodings.defaultEdgeEncoding') + config.get('config.encodings.defaultSegmentEncoding') +
                        label + config.get('config.encodings.segmentSeparator') + config.get('config.nodeIds.templates.samplepanel.client'),
                info: {
                    accountItem: accountItem,
                    threadItem: threadItem,
                    grants: 1
                }
            };
            that.params.globals.typeServers[that.serverTypeId].addNewPermission(data, callback)
        }
    ], function(error, permissionItem){
        if(error) {
            return res.send(JSON.stringify({error: 1, errorInfo: error}));
        }
        res.send(JSON.stringify({permission: permissionItem}));
    });
};


module.exports = SamplePanel;