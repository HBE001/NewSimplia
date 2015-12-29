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

var BehaviourEngine = require('./../lib/behaviourengine');
var async = require('async');
var bcrypt = require('bcrypt');

function BasicServerComponent(params, callback) {
    this.params = params;
    this.context = {};

    this.init(callback || undefined);
}

BasicServerComponent.prototype.init = function(callback) {
    this.applyContext(this.params.context || {});
    this.applyTemplate(this.params.template || {});
    this.addIds(this.params.ids || {});
    this.tip = this.params.tip;
    this.setupRoute();

    if(typeof callback !== "undefined") {
        callback();
    }
};

BasicServerComponent.prototype.setupRoute = function() {
    var that = this;
    this.params.globals.apps.express.post('/' + this.serverTypeId + '/' + this.nodeId, function (req, res, next) {
        that.handleBasicRoute(req, res, next);
    });

    this.params.globals.apps.express.post('/' + this.serverTypeId + '/' + this.nodeId, function (req, res, next) {
        that.handleRoute(req, res, next);
    });

};

BasicServerComponent.prototype.handleBasicRoute = function(req, res, next) {
    var commandHandler = {
        'refreshPanel': this.refreshPanel.bind(this, req, res)
    };

    var data = (typeof req.body.data !== "undefined") ? (JSON.parse(req.body.data)) : {};
    if(typeof commandHandler[data.command] !== "undefined") {
        commandHandler[data.command](data);
    }
    else {
        next();
    }
};

BasicServerComponent.prototype.handleRoute = function(req, res, next) {

};

BasicServerComponent.prototype.refreshPanel = function(req, res, data) {
    res.send(JSON.stringify({}));
};

BasicServerComponent.prototype.applyContext = function(context) {
    for(var i in context) {
        this.context[i] = context[i];
    }
};


BasicServerComponent.prototype.applyTemplate = function(template) {
    if(template && (typeof template.Presentation !== "undefined")) {
        for (var i in template.Presentation) {
            this[i] = template.Presentation[i];
        }
    }

    if(template && (typeof template.Behaviour !== "undefined")) {
        this.behaviourEngine = new BehaviourEngine(template.Behaviour, 'state');
    }
};

BasicServerComponent.prototype.addIds = function(ids) {
    for(var i in ids) {
        this[i] = ids[i];
    }
};

BasicServerComponent.prototype.handleLeftMenuClick = function(req, res, data) {
    var that = this;
    console.log('handleLeftMenuClick-data:', data);
    async.waterfall([
        this.params.oxygenLib.getPermission.bind(this.params.oxygenLib, data.nodeId),
        function(permission, callback) {
            that.params.oxygenLib.getTip(permission.OnObject, function(error, tipItem){
                callback(error, tipItem, permission);
            });
        },
        function(tipItem, permission, callback) {
            that.params.globals.typeServers[tipItem.Type].getClientTipData(
                {
                    viewTemplate: permission.UsingView,
                    threadId: permission.InThread,
                    roleInObject: permission.RoleInObject,
                    roleInThread: permission.RoleInThread,
                    serverNodeId: tipItem.Node,
                    sessionId: req.cookies[that.params.config.get('config.cookies.names.sessionId')],
                    accountId: permission.AllowedToAccount
                },
                function(error, view) {
                    console.log('handleLeftMenuClick-view:', view);
                    callback(error, view, tipItem, permission)
                }
            )
        },
        function(view, tipItem, permission, callback) {
            that.params.oxygenLib.getTip(permission.AllowedToAccount, function(error, accountItem){
                callback(error, view, tipItem, accountItem)
            });
        },
        function(view, tipItem, accountItem, callback) {
            var sessionIdCookieName = that.params.config.get('config.cookies.names.sessionId');
            //console.log('handleLeftMenuClick-sessionId:', req.cookies[sessionIdCookieName]);
            if(typeof req.cookies[sessionIdCookieName] !== "undefined") {
                that.params.oxygenLib.getTip(req.cookies[sessionIdCookieName], function(error, sessionItem){
                    callback(error, view, tipItem, accountItem, sessionItem);
                });
            }
            else {
                callback(null, view, tipItem, accountItem);
            }
        }
    ], function(error, view, tipItem, accountItem, sessionItem){
        if(error) {
            return res.send(JSON.stringify({error: 1, errorData: error}));
        }
        that.params.oxygenLib.getGUID(function(error, guid){
            if(error) {
                return res.send(JSON.stringify({error: 1, errorData: error}));
            }

            that.params.globals.allTips[tipItem.Node].getLeftMenuClickReturnParams(function(error, params){
                if(error) {
                    return res.send(JSON.stringify({error: 1, errorData: error}));
                }

                var returnData = {
                    returnType: 'panel',
                    panelType: view.rootTemplate.Code.PanelName,
                    initData: {
                        typeNodeId: tipItem.Type,
                        serverNodeId: tipItem.Node,
                        accountItem: accountItem,
                        threadItem: view.threadItem,
                        template: view.template.Code,
                        roleInObject: view.roleInObject,
                        roleInThread: view.roleInThread,
                        clientNodeId: guid,
                        sessionItem: sessionItem || null
                    }
                };

                for(var i in params) {
                    returnData.initData[i] = params[i];
                }
                res.send(JSON.stringify(returnData));

            });
        });
    });
};



BasicServerComponent.prototype.getLeftMenuClickReturnParams = function(callback) {
    callback(null, {});
};

BasicServerComponent.prototype.authenticateAccount = function(username, password, mCallback) {
    var params = {
        TableName: this.params.config.get('config.dynamodb.tables.registeredaccounts.tableName'),
        IndexName: this.params.config.get('config.dynamodb.tables.registeredaccounts.indices.username'),
        KeyConditionExpression: 'Username = :username',
        ExpressionAttributeValues: {
            ':username': username //data.data.Username
        }
    };

    var that = this;

    async.waterfall([
        this.params.oxygenLib.getRegisteredAccount.bind(this.params.oxygenLib, username),
        function(account, callback) {
            if(!(bcrypt.compareSync(password, account.Password))) {
                callback('Invalid password!');
            }
            else {
                callback(null, account);
            }
        },
        function(account, callback) {
            that.params.oxygenLib.getRelatedComponent(
                that.params.config.get('config.relations.registeredaccount'),
                'ARG2',
                account.Node,
                callback
            );
        }
    ], mCallback)
};

BasicServerComponent.prototype.getAccountItem = function(username, mCallback) {
    var that = this;
    async.waterfall([
        this.params.oxygenLib.getRegisteredAccount.bind(this.params.oxygenLib, username),
        function(account, callback) {
            that.params.oxygenLib.getRelatedComponent(
                that.params.config.get('config.relations.registeredaccount'),
                'ARG2',
                account.Node,
                callback
            );
        }
    ], mCallback)
};

BasicServerComponent.prototype.setCookie = function(res, name, value) {
    res.cookie(
        name,
        value,
        {
            path: this.params.config.get('config.cookies.data.path'),
            domain: this.params.config.get('config.cookies.data.domain')
        }
    );

};

module.exports = BasicServerComponent;