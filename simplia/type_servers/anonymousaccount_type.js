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

var async = require('async');
var fs = require('fs');
var BasicType = require('./../lib/basictype');
var util = require('util');


function AnonymousAccountType(params, callback) {
    BasicType.call(this, params, callback);
}

//Inheriting from the base object
util.inherits(AnonymousAccountType, BasicType);

AnonymousAccountType.prototype.init = function(callback) {
    var that = this;
    BasicType.prototype.init.call(this, function() {
        that.standardTipData = {ExtendedAttributes: {}};
        that.relationParam = 'ARG2';
        that.standardTipData.ExtendedAttributes[that.params.config.get('config.dynamodb.tables.components.tableName')] = 'ARG1';
        that.standardTipData.ExtendedAttributes[that.params.config.get('config.dynamodb.tables.anonymousaccounts.tableName')] = that.relationParam;

        if(typeof callback !== "undefined") {
            callback();
        }
    });
};

AnonymousAccountType.prototype.createServerTip = function(templateId, templateData, tipData, accountData, req, mCallback) {
    var that = this;

    util._extend(tipData, this.standardTipData);
    async.waterfall([
        function(callback) {
            that.params.oxygenLib.createServerTip(templateId, templateData, tipData, function(error, tipData){
                //console.log('servertipdata:', tipData);
                if(error) {
                    console.log('createservertip-error:', error);
                }
                callback(error, tipData);
            });
        },
        function(accountItem, callback) {
            //console.log('tipData:', accountItem);
            that.params.oxygenLib.getGUID(function(error, guid){
                callback(error, accountItem, guid);
            });
        },
        function(accountItem, guid, callback) {
            that.createAnonymousAccountProfile(req, guid, accountData, function(error, profileItem){
                callback(error, accountItem, profileItem);
            });
        },
        function(accountItem, profileItem, callback) {
            that.params.oxygenLib.createRelation(that.params.config.get('config.relations.anonymousaccount'), accountItem.Node, profileItem.Node, function(error, relationItem){
                callback(error, accountItem);
            });
        }
    ], function(error, accountItem){
        mCallback(error, accountItem);
    });
};

AnonymousAccountType.prototype.getClientTipData = function(clientData, mCallback) {
    var threadId = "";
    var permission = "";
    var that = this;
    //console.log('AnonymousAccountType.getClientTipData-clientData:', clientData);
    async.waterfall([
        this.params.oxygenLib.getEdges.bind(
            that.params.oxygenLib,
            clientData.serverNodeId,
            this.params.oxygenLib.createSimplePartialOES([this.params.config.get('config.encodings.labels.threads')])
        ),
        function(edges, callback) {
            if(!edges || edges.length == 0) {
                return callback('Anonymous thread not found');
            }
            threadId = edges[0].endString;
            that.params.oxygenLib.getPermissions(
                'object',
                {},
                {':OnObject': clientData.serverNodeId, ':InThread': threadId},
                'InThread = :InThread',
                callback
            )
        },
        function(permissions, callback){
            if(!permissions || permissions.length == 0) {
                return callback("View not found");
            }
            permission = permissions[0];
            //console.log('AnonymousAccountType.getClientTipData-permission:', permission);
            that.params.oxygenLib.getTemplate(permissions[0].UsingView, callback);
        },
        function(templateItem, callback) {
            that.params.oxygenLib.getTemplate(templateItem.RootTemplate, function(error, rootTemplateItem){
                callback(error, templateItem, rootTemplateItem);
            });
        },
        function(templateItem, rootTemplateItem, callback) {
            that.params.oxygenLib.getTypeFromTemplate(templateItem, function(error, templateItem, typeItem){
                callback(error, templateItem, rootTemplateItem, typeItem);
            });
        },
        function(templateItem, rootTemplateItem, typeItem, callback) {
            that.params.oxygenLib.getTip(threadId, function(error, threadItem){
                callback(error, templateItem, rootTemplateItem, typeItem, threadItem);
            });
        }
    ],function(error, templateItem, rootTemplateItem, typeItem, threadItem) {
        if(error) {
            console.log('getClientTipData-error:', error);
        }
        mCallback(
            error,
            {
                template: templateItem || {},
                type: typeItem || {},
                rootTemplate: rootTemplateItem,
                threadItem: threadItem,
                roleInObject: permission.RoleInObject,
                roleInThread: permission.RoleInThread
            }
        );
    });
};

AnonymousAccountType.prototype.createAnonymousAccountProfile = function(req, nodeId, accountData, callback) {
    var params = {
        TableName: this.params.config.get('config.dynamodb.tables.anonymousaccounts.tableName'),
        Item: {
            location: accountData.location || {},
            IP: this.getIP(req),
            Relation: { RelationDN: this.params.config.get('config.relations.anonymousaccount'), Param: this.relationParam}
        }
    };

    params.Item.Node = nodeId;
    params.Item.Edge = this.params.config.get('config.dynamodb.fixedValues.attributesEdge');

    //console.log('anonymousaccountprofile-params:', params);

    this.params.globals.apps.docClient.putItem(params, function(error){
        if(error) {
            console.log('createanonymousaccountprofile-error:', error);
        }
        callback(error, params.Item);
    });
};

AnonymousAccountType.prototype.getIP = function(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

AnonymousAccountType.prototype.handleRoute = function(req, res, next) {
    var that = this;

    var tipId = req.params.tipId;
    var command = req.body.command;

    var commandHandler = {
        'createServerTip': function (data) {
            that.createServerTip(data.templateId, data.templateData || {}, data.tipData || {}, data.accountData || {}, req, function (error, tipData) {
                if (error) {
                    return res.send(JSON.stringify({error: 1, errorData: error}));
                }
                res.send(JSON.stringify({serverTip: tipData}));
            });
        },
        'awakenServerTip': function (data) {
            that.awakenServerTip(data.nodeId, function (error) {
                if (error) {
                    return res.send(JSON.stringify({error: 1, errorData: error}));
                }
                res.send(JSON.stringify({}));
            });
        },
        'relayServerTip': function (data) {
            async.waterfall([
                function (callback) {
                    if (typeof that.params.globals.allTips[tipId] === "undefined") {
                        return that.awakenServerTip(tipId, callback);
                    }
                    callback(null);
                }
            ], function (error) {
                if (error) {
                    return res.send(JSON.stringify({error: 1, errorInfo: error}));
                }
                next();
            });
        },
        'getClientTipData': function (data) {
            //console.log('getClientTipData-data:', data);
            that.getClientTipData(data, function (error, view) {
                //console.log('items:', items);
                if (error) {
                    return res.send(JSON.stringify({error: 1, errorData: error}));
                }
                else if (typeof view === "undefined") {
                    return res.send(JSON.stringify({error: 1, errorData: 'Not compatible views found'}));
                }
                that.params.oxygenLib.getGUID(function(error, guid){
                    if(error) {
                        return res.send(JSON.stringify({error: 1, errorData: error}));
                    }
                    res.send(
                        JSON.stringify(
                            {
                                panelType: view.rootTemplate.Code.PanelName,
                                initData: {
                                    typeNodeId: that.params.typeNodeId,
                                    serverNodeId: data.serverNodeId,
                                    threadItem: view.threadItem,
                                    template: view.template.Code,
                                    roleInObject: view.roleInObject,
                                    roleInThread: view.roleInThread,
                                    clientNodeId: guid
                                }
                            }
                        )
                    );

                });
            });
        }
    };

    var data = (typeof req.body.data !== "undefined") ? (JSON.parse(req.body.data)) : {};
    commandHandler[command](data);
};

module.exports = AnonymousAccountType;

