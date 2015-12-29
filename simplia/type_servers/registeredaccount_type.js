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
var bcrypt = require('bcrypt');

function RegisteredAccountType(params, callback) {
    BasicType.call(this, params, callback);
}

//Inheriting from the base object
util.inherits(RegisteredAccountType, BasicType);

RegisteredAccountType.prototype.init = function(callback) {
    var that = this;
    BasicType.prototype.init.call(this, function() {
        that.standardTipData = {ExtendedAttributes: {}};
        that.relationParam = 'ARG2';
        that.standardTipData.ExtendedAttributes[that.params.config.get('config.dynamodb.tables.components.tableName')] = 'ARG1';
        that.standardTipData.ExtendedAttributes[that.params.config.get('config.dynamodb.tables.registeredaccounts.tableName')] = that.relationParam;

        if(typeof callback !== "undefined") {
            callback();
        }
    });
};

RegisteredAccountType.prototype.createServerTip = function(templateId, templateData, tipData, accountData, mCallback) {
    var that = this;

    util._extend(tipData, this.standardTipData);
    async.waterfall([
        function(callback) {
            that.params.oxygenLib.createServerTip(templateId, templateData, tipData, function(error, tipData){
                console.log('servertipdata:', tipData);
                if(error) {
                    console.log('createservertip-error:', error);
                }
                callback(error, tipData);
            });
        },
        function(accountItem, callback) {
            console.log('tipData:', accountItem);
            that.params.oxygenLib.getGUID(function(error, guid){
                callback(error, accountItem, guid);
            });
        },
        function(accountItem, guid, callback) {
            that.createRegisteredAccountProfile(accountItem, accountData, function(error, profileItem){
                callback(error, accountItem, profileItem);
            });
        },
        function(accountItem, profileItem, callback) {
            that.params.oxygenLib.createRelation(that.params.config.get('config.relations.registeredaccount'), accountItem.Node, profileItem.Node, function(error, relationItem){
                callback(error, accountItem);
            });
        }
    ], function(error, accountItem){
        mCallback(error, accountItem);
    });
};


RegisteredAccountType.prototype.createRegisteredAccountProfile = function(accountItem, accountData, callback) {
    var params = {
        TableName: this.params.config.get('config.dynamodb.tables.registeredaccounts.tableName'),
        Item: {
            Username: accountItem.DisplayName,
            Email: accountData.Email,
            Password: bcrypt.hashSync(accountData.Password, this.params.config.get('config.passwordEncryption.saltLength'))
        }
    };

    params.Item.Node = accountItem.Node;
    params.Item.Edge = this.params.config.get('config.dynamodb.fixedValues.attributesEdge');

    this.params.globals.apps.docClient.putItem(params, function(error){
        if(error) {
            console.log('createRegisteredAccountProfile-error:', error);
        }
        callback(error, params.Item);
    });
};


RegisteredAccountType.prototype.getClientTipData = function(clientData, mCallback) {
    var threadId = "";
    var permission = "";
    var that = this;
    async.waterfall([
        that.params.oxygenLib.getEdges.bind(
            that.params.oxygenLib,
            clientData.serverNodeId,
            this.params.oxygenLib.createSimplePartialOES([this.params.config.get('config.encodings.labels.threads')])
        ),
        function(edges, callback) {
            if(!edges || edges.length == 0) {
                return callback('Home thread not found');
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
            })
        },
        function(templateItem, rootTemplateItem, typeItem, threadItem, callback) {
            that.params.oxygenLib.getTip(clientData.serverNodeId, function(error, accountItem){
                callback(error, templateItem, rootTemplateItem, typeItem, threadItem, accountItem);
            });
        }
    ],function(error, templateItem, rootTemplateItem, typeItem, threadItem, accountItem) {
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
                roleInThread: permission.RoleInThread,
                roleInObject: permission.RoleInObject,
                accountItem: accountItem
            }
        );
    });
};


RegisteredAccountType.prototype.handleRoute = function(req, res, next) {
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
            async.waterfall([
                that.setupUserSession.bind(that, data.sessionId),
                function(sessionItem, accountItem, callback) {
                    var data = {serverNodeId: accountItem.Node};
                    that.getClientTipData(data, function(error, view){
                        callback(error, view, sessionItem)
                    });
                }
            ], function(error, view, sessionItem){
                that.sendClientTipData(error, res, view, sessionItem)
            });
        }
    };

    var data = (typeof req.body.data !== "undefined") ? (JSON.parse(req.body.data)) : {};
    commandHandler[command](data);
};

RegisteredAccountType.prototype.sendClientTipData = function(error, res, viewData, sessionItem) {
    var that = this;
    if (error) {
        return res.send(JSON.stringify({error: 1, errorInfo: error}));
    }
    else if (typeof viewData === "undefined") {
        return res.send(JSON.stringify({error: 1, errorInfo: 'Not compatible views found'}));
    }
    this.params.oxygenLib.getGUID(function(error, guid){
        if(error) {
            return res.send(JSON.stringify({error: 1, errorInfo: error}));
        }

        res.cookie(
            that.params.config.get('config.cookies.names.sessionId'),
            sessionItem.Node,
            {
                path: that.params.config.get('config.cookies.data.path'),
                domain: that.params.config.get('config.cookies.data.domain')
            }
        );

        res.send(
            JSON.stringify(
                {
                    panelType: viewData.rootTemplate.Code.PanelName,
                    initData: {
                        typeNodeId: viewData.accountItem.Type,
                        serverNodeId: viewData.accountItem.Node,
                        threadItem: viewData.threadItem,
                        template: viewData.template.Code,
                        roleInObject: viewData.roleInObject,
                        roleInThread: viewData.roleInThread,
                        clientNodeId: guid,
                        accountItem: viewData.accountItem,
                        sessionItem: sessionItem
                    }
                }
            )
        );
    });
};


RegisteredAccountType.prototype.setupUserSession = function(sessionId, mCallback) {
    var that = this;

    async.waterfall([
        this.params.oxygenLib.getTip.bind(this.params.oxygenLib, sessionId),
        function(sessionItem, callback) {
            console.log('awakening session tip:', sessionItem);
            if (typeof that.params.globals.allTips[sessionItem.Node] === "undefined") {
                that.params.oxygenLib.awakenServerTip(sessionItem.Node, function(error){
                    callback(error, sessionItem);
                }, true);
            }
            else {
                callback(null, sessionItem);
            }
        },
        function(sessionItem, callback) {
            that.params.oxygenLib.getTip(sessionItem.ExtendedAttributes.AccountId, function(error, accountItem){
                callback(error, sessionItem, accountItem);
            });
        },
        function(sessionItem, accountItem, callback) {
            //console.log('awakening account tip');
            if (typeof that.params.globals.allTips[accountItem.Node] === "undefined") {
                that.params.oxygenLib.awakenServerTip(accountItem.Node, function(error){
                    callback(error, sessionItem, accountItem);
                }, true);
            }
            else {
                callback(null, sessionItem, accountItem);
            }
        }
    ], mCallback);
};

module.exports = RegisteredAccountType;

