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

function RegisteredAccount(params, callback) {
   //Calling base constructor
    BasicServerComponent.call(this, params, callback || undefined);
}

//Inheriting from the base object
util.inherits(RegisteredAccount, BasicServerComponent);

RegisteredAccount.prototype.init = function(mCallback) {
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

RegisteredAccount.prototype.handleRoute = function(req, res, next) {
    var commandHandler = {
        'openDynamodbViewer': this.openDynamodbViewer.bind(this, req, res),
        'grantODE': this.grantODE.bind(this, req, res)
    };

    var data = (typeof req.body.data !== "undefined") ? (JSON.parse(req.body.data)) : {};
    commandHandler[data.command](data);
};

RegisteredAccount.prototype.openDynamodbViewer = function(req, res, data) {
    var that = this;
    if(typeof this.dynamodbViewer === "undefined") {
        async.waterfall([
            function(callback) {
                that.params.globals.typeServers[that.params.config.get('config.nodeIds.types.dynamodbviewer.server')].createServerTip(
                    that.params.config.get('config.nodeIds.templates.dynamodbviewer.server'),
                    {

                    },
                    {

                    },
                    function(error, tipItem) {
                        that.dynamodbViewer = tipItem.Node;
                        callback(error, tipItem);
                    }
                );
            },
            function(tipItem, callback) {
                that.params.oxygenLib.awakenServerTip(tipItem.Node, function(error){
                    callback(error, tipItem);
                });
            }
        ],function(error, tipItem) {
            if(error) {
                return res.send(JSON.stringify({error: 1, errorInfo: error}));
            }
            that.sendClientTipData(req, res, data, tipItem);
        });
    }
    else {
        //send some info
        async.waterfall([
            this.params.oxygenLib.awakenServerTip.bind(this.params.oxygenLib, this.dynamodbViewer),
            function(callback) {
                that.params.oxygenLib.getTip(that.dynamodbViewer, callback)
            }
        ],function(error, tipItem){
            if(error) {
                return res.send(JSON.stringify({error: 1, errorInfo: error}));
            }
            that.sendClientTipData(req, res, data, tipItem);
        });
    }
};

RegisteredAccount.prototype.grantODE = function(req, res, data) {
    var that = this;
    async.waterfall([
        this.getAccountItem.bind(this, data.accountName),
        function(accountItem, callback) {
            that.params.oxygenLib.getTemplate(that.params.config.get('config.nodeIds.templates.ode.server'), function(error, templateItem){
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
                //viewId: config.get('config.encodings.defaultEdgeEncoding') + config.get('config.encodings.defaultSegmentEncoding') +
                //        label + config.get('config.encodings.segmentSeparator') + (edgeValue || ""),
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

RegisteredAccount.prototype.sendClientTipData = function(req, res, data, tipItem) {
    var that = this;
    console.log('tipItem:', tipItem);
    async.waterfall([
        function(callback) {
            var clientData = {
                threadId: data.threadId,
                roleInObject: data.roleInObject,
                roleInThread: data.roleInThread,
                serverNodeId: tipItem.Node,
                sessionId: req.cookies[that.params.config.get('config.cookies.names.sessionId')],
                accountId: data.accountId
            };
            that.params.globals.typeServers[tipItem.Type].getClientTipData(clientData, callback);
        }
    ], function(error, clientTipData){
        //console.log('arguments:', arguments);
        //Send clientTipData
        that.viewerGDN = clientTipData.panelName;
        console.log('clientTipData:', clientTipData);
        that.params.globals.typeServers[that.params.config.get('config.nodeIds.types.dynamodbviewer.server')].sendClientTipData(
            error,
            res,
            clientTipData
        );
    });
};

module.exports = RegisteredAccount;