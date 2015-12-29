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
var util = require('util');
var BasicServerComponent = require('./../lib/basicservercomponent');
var async = require('async');

function AnonymousAccount(params, callback) {
    this.reserverdOperations = {
        'Register': {
            serverFn: 'doRegistration',
            panel: 'registrationpanel'
        },
        'Login': {
            serverFn: 'doLogin',
            panel: 'loginpanel'
        }
    };
    this.state = 'normal';

    //Calling base constructor
    BasicServerComponent.call(this, params, callback || undefined);
}

//Inheriting from the base object
util.inherits(AnonymousAccount, BasicServerComponent);

AnonymousAccount.prototype.init = function (callback) {
    var that = this;
    BasicServerComponent.prototype.init.call(this, function () {
        if (typeof callback !== "undefined") {
            callback();
        }
    });
};

AnonymousAccount.prototype.handleRoute = function (req, res, next) {
    var that = this;

    var command = {
        'getOperations': function () {
            that.getOperations(req, res, data);
        },
        'doOperation': function (data) {
            that[that.reserverdOperations[data.operation].serverFn](req, res, data);
        },
        'registerAccount': function (data) {
            that.registerAccount(req, res, data);
        },
        'loginAccount': function (data) {
            that.loginAccount(req, res, data);
        }
    };
    var data = JSON.parse(req.body.data);
    command[data.command](data || {});

};

AnonymousAccount.prototype.getOperations = function (req, res, data) {
    //res.send(JSON.stringify({operations: this.reserverdOperations}));
    res.send(JSON.stringify(this.behaviourEngine.getRoleInputs(data.roleInObject, this.state)));
};

AnonymousAccount.prototype.doOperation = function (req, res, data) {

    var operation = data.operation;

    var that = this;
    var takeAction = {
        'Register': that.doRegistration.bind(this),
        'Login': that.doLogin(this)
    };

    takeAction[operation](req, res, data);

    /*
     this.behaviourEngine.takeAction(this, data.role, this.state, operation, function(){
     res.send();
     });
     */
};

AnonymousAccount.prototype.doRegistration = function (req, res, data) {
    var that = this;
    res.send(JSON.stringify({panel: this.reserverdOperations['Register'].panel}));
};

AnonymousAccount.prototype.doLogin = function (req, res, data) {
    res.send(JSON.stringify({panel: this.reserverdOperations['Login'].panel}));
};

AnonymousAccount.prototype.takeAction = function (input, callback) {
    this.reserverdOperations[input].serverFn.call(this, callback);
};

AnonymousAccount.prototype.registerAccount = function (req, res, data) {
    var that = this;
    async.waterfall([
        function (callback) {
            that.createRegisteredAccount(data.data, callback);
        },
        function (accountItem, callback) {
            that.createHomeThread(accountItem, data.data, function (error, threadItem) {
                callback(error, accountItem, threadItem);
            });
        },
        function (accountItem, threadItem, callback) {
            that.addPermissions(accountItem, threadItem, function (error) {
                callback(error, accountItem)
            });
        }
    ], function (error, accountItem) {
        if (error) {
            console.log('registerAccount-error:', error);
            return res.send(JSON.stringify({error: 1, errorInfo: error}));
        }
        console.log('accountItem:', accountItem);
        res.send(JSON.stringify({error: 0, accountItem: accountItem, status: 'Registration successful!'}));
    });
};

AnonymousAccount.prototype.loginAccount = function (req, res, data) {
    var that = this;

    async.waterfall([
        this.authenticateAccount.bind(this, data.data.Username, data.data.Password),
        this.establishSession.bind(this),
        function (accountItem, sessionItem, callback) {
            that.params.globals.typeServers[accountItem.Type].getClientTipData(
                {
                    serverNodeId: accountItem.Node
                },
                function (error, viewData) {
                    callback(error, viewData, accountItem, sessionItem);
                }
            );
        }
    ], function (error, viewData, accountItem, sessionItem) {
        console.log('arguments:', arguments);
        if (error) {
            return res.send(JSON.stringify({error: 1, errorInfo: error}));
        }
        that.params.globals.typeServers[accountItem.Type].sendClientTipData(error, res, viewData, sessionItem);
    });
};

AnonymousAccount.prototype.createRegisteredAccount = function (accountData, mCallback) {
    var that = this;
    var registeredAccountTemplateId = this.params.config.get('config.nodeIds.templates.registeredaccount.server');

    async.waterfall([
        this.params.oxygenLib.getTemplate.bind(this.params.oxygenLib, registeredAccountTemplateId),
        function (templateItem, callback) {
            that.params.oxygenLib.getGUID(function (error, guid) {
                callback(error, templateItem, guid);
            });
        },
        function (templateItem, guid, callback) {
            var options = {
                Prefix: accountData.Username,
                Type: 'Simple',
                GUID: guid
            };
            that.params.oxygenLib.createGDN(options, function (error, gdn) {
                callback(error, templateItem, guid, gdn);
            })
        },
        function (templateItem, guid, gdn, callback) {
            that.params.globals.typeServers[templateItem.Type].createServerTip(
                registeredAccountTemplateId,
                {},
                {
                    Node: guid,
                    OwnerID: guid,
                    OrganizationID: 0,
                    AccountID: 0,
                    DisplayName: gdn
                },
                accountData,
                callback
            );
        }
    ], mCallback);
};


AnonymousAccount.prototype.createHomeThread = function (accountItem, accountData, mCallback) {
    var that = this;
    var homeThreadTemplateId = this.params.config.get('config.nodeIds.templates.homethread.server');

    async.waterfall([
        this.params.oxygenLib.getTemplate.bind(this.params.oxygenLib, homeThreadTemplateId),
        function (threadTemplateItem, callback) {
            that.params.globals.typeServers[threadTemplateItem.Type].createServerTip(
                homeThreadTemplateId,
                {},
                {
                    OwnerID: accountItem.OwnerID,
                    OrganizationID: accountItem.OrganizationID,
                    AccountID: accountItem.AccountID,
                    DisplayName: accountItem.DisplayName
                },
                function (error, threadItem) {
                    callback(error, threadItem, threadTemplateItem);
                }
            );
        },
        function (threadItem, threadTemplateItem, callback) {
            that.params.globals.typeServers[accountItem.Type].createThread(accountItem, threadItem, threadTemplateItem, function (error) {
                callback(error, threadItem);
            });
        }
    ], mCallback);
};

AnonymousAccount.prototype.addPermissions = function (accountItem, threadItem, mCallback) {
    var that = this;
    async.waterfall([
        this.addRegisteredAccountPermission.bind(this, accountItem, threadItem),
        function (permissionItem, callback) {
            that.addOxygenCatalogPermission(accountItem, threadItem, callback);
        },
        function (permissionItem, callback) {
            that.addMogopakPermission(accountItem, threadItem, callback);
        }
    ], mCallback);
};

AnonymousAccount.prototype.addRegisteredAccountPermission = function (accountItem, threadItem, mCallback) {
    var accountPermissionAttributes = {
        AllowedToAccount: accountItem.Node,
        AllowedToDN: accountItem.DisplayName || undefined,
        InThread: threadItem.Node,
        InThreadDN: threadItem.DisplayName || undefined,
        OnObject: accountItem.Node,
        OnObjectFTT: this.params.oxygenLib.createSimpleOES([
            this.params.config.get('config.dynamodb.families.resources.name'),
            this.params.config.get('config.dynamodb.families.resources.types.registeredaccount.name'),
            this.params.config.get('config.dynamodb.families.resources.types.registeredaccount.rootTemplates.registeredaccount.name')
        ]),
        OnObjectDN: accountItem.DisplayName || undefined,
        //UsingView: "",
        FromPermissionNodes: 0,
        AllowedByAccount: 0,
        RoleInObject: this.params.config.get('config.roles.registeredUser'),
        RoleInThread: this.params.config.get('config.roles.registeredUser'),
        Grants: 0
    };

    //console.log('accountPermissionAttributes:', accountPermissionAttributes);

    var that = this;
    async.waterfall([
        this.params.oxygenLib.getLinkedEdges.bind(this.params.oxygenLib, accountItem.Type, this.params.config.get('config.encodings.labels.views')),
        function (edges, callback) {
            if ((typeof edges === "undefined") || edges.length == 0) {
                return callback('view not found');
            }
            accountPermissionAttributes.UsingView = edges[0];
            //console.log('accountPermissionAttributes-updated:', accountPermissionAttributes);
            that.params.oxygenLib.getGUID(callback);
        },
        function (guid, callback) {
            that.params.oxygenLib.addPermission(guid, accountPermissionAttributes, callback);
        }
    ], mCallback);
};

AnonymousAccount.prototype.addOxygenCatalogPermission = function (accountItem, threadItem, mCallback) {
    var catalogPermissionAttributes = {
        AllowedToAccount: accountItem.Node,
        AllowedToDN: accountItem.DisplayName || undefined,
        InThread: threadItem.Node,
        InThreadDN: threadItem.DisplayName || undefined,
        OnObject: this.params.config.get('config.nodeIds.tips.oxygencatalog'),
        OnObjectFTT: this.params.oxygenLib.createSimpleOES([
            this.params.config.get('config.dynamodb.families.resources.name'),
            this.params.config.get('config.dynamodb.families.resources.types.oxygencatalog.name'),
            this.params.config.get('config.dynamodb.families.resources.types.oxygencatalog.rootTemplates.oxygencatalog.name')
        ]),
        //OnObjectDN: accountItem.DisplayName || undefined,
        //UsingView: "",
        FromPermissionNodes: 0,
        AllowedByAccount: 0,
        RoleInObject: this.params.config.get('config.roles.buyer'),
        RoleInThread: this.params.config.get('config.roles.buyer'),
        Grants: 0
    };

    var that = this;
    async.waterfall([
        this.params.oxygenLib.getTip.bind(this.params.oxygenLib, this.params.config.get('config.nodeIds.tips.oxygencatalog')),
        function (catalogItem, callback) {
            that.params.oxygenLib.getLinkedEdges(catalogItem.Type, that.params.config.get('config.encodings.labels.views'), callback);
        },
        function (edges, callback) {
            if ((typeof edges === "undefined") || edges.length == 0) {
                return callback('view not found');
            }
            catalogPermissionAttributes.UsingView = edges[0];
            that.params.oxygenLib.getGUID(callback);
        },
        function (guid, callback) {
            that.params.oxygenLib.addPermission(guid, catalogPermissionAttributes, callback);
        }
    ], mCallback);
};

AnonymousAccount.prototype.addMogopakPermission = function (accountItem, threadItem, mCallback) {
    var catalogPermissionAttributes = {
        AllowedToAccount: accountItem.Node,
        AllowedToDN: accountItem.DisplayName || undefined,
        InThread: threadItem.Node,
        InThreadDN: threadItem.DisplayName || undefined,
        OnObject: this.params.config.get('config.nodeIds.tips.mogopak'),
        OnObjectFTT: this.params.oxygenLib.createSimpleOES([
            this.params.config.get('config.dynamodb.families.resources.name'),
            this.params.config.get('config.dynamodb.families.resources.types.mogopak.name'),
            this.params.config.get('config.dynamodb.families.resources.types.mogopak.rootTemplates.mogopak.name')
        ]),
        //OnObjectDN: accountItem.DisplayName || undefined,
        //UsingView: "",
        FromPermissionNodes: 0,
        AllowedByAccount: 0,
        RoleInObject: this.params.config.get('config.roles.author'),
        RoleInThread: this.params.config.get('config.roles.author'),
        Grants: 0
    };

    var that = this;
    async.waterfall([
        this.params.oxygenLib.getTip.bind(this.params.oxygenLib, this.params.config.get('config.nodeIds.tips.mogopak')),
        function (catalogItem, callback) {
            that.params.oxygenLib.getLinkedEdges(catalogItem.Type, that.params.config.get('config.encodings.labels.views'), callback);
        },
        function (edges, callback) {
            console.log('linked-edges:', edges);
            if ((typeof edges === "undefined") || edges.length == 0) {
                return callback('view not found');
            }
            catalogPermissionAttributes.UsingView = edges[0];
            that.params.oxygenLib.getGUID(callback);
        },
        function (guid, callback) {
            that.params.oxygenLib.addPermission(guid, catalogPermissionAttributes, callback);
        }
    ], mCallback);
};

AnonymousAccount.prototype.establishSession = function (accountItem, mCallback) {
    var that = this;

    async.waterfall([
        function (callback) {
            //Check if the registered account is already awakened
            if (typeof that.params.globals.allTips[accountItem.Node] === "undefined") {
                return that.params.oxygenLib.awakenServerTip(accountItem.Node, function (error) {
                    callback(error);
                }, true);
            }
            callback(null);
        },
        function (callback) {
            that.createActiveSession(accountItem, function (error, sessionItem) {
                console.log('Created-active-session - accountItem:', accountItem, ' - saessionItem:', sessionItem);
                callback(error, accountItem, sessionItem);
            });
        }
    ], mCallback);
};

AnonymousAccount.prototype.createActiveSession = function (accountItem, mCallback) {
    var activeSessionTemplateId = this.params.config.get('config.nodeIds.templates.basicactivesession.id');
    var that = this;

    async.waterfall([
        this.params.oxygenLib.getTemplate.bind(this.params.oxygenLib, activeSessionTemplateId),
        function (templateId, callback) {
            that.params.globals.typeServers[templateId.Type].createServerTip(
                activeSessionTemplateId,
                {},
                {
                    OwnerID: accountItem.OwnerID,
                    OrganizationID: accountItem.OrganizationID,
                    AccountID: accountItem.AccountID,
                    DisplayName: accountItem.DisplayName,
                    ExtendedAttributes: {
                        AccountId: accountItem.Node
                    }
                },
                callback
            );
        }
    ], mCallback);
};

module.exports = AnonymousAccount;
