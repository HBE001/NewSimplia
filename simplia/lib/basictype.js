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

function BasicType(params, callback) {
    this.params = params;

    this.init(callback || undefined);
}

BasicType.prototype.init = function(callback) {
    this.setupRoute(callback);
};

BasicType.prototype.awakenServerTip = function(nodeId, callback) {
    this.params.oxygenLib.awakenServerTip(nodeId, function(error){
        if(error) {
            console.log('awakenServerTip-error:', error);
        }
        callback(error, nodeId);
    }, true);
};


BasicType.prototype.createServerTip = function(templateId, templateData, tipData, callback) {
    this.params.oxygenLib.createServerTip(templateId, templateData, tipData, function(error, tipData){
        if(error) {
            console.log('createservertip-error:', error);
        }
        callback(error, tipData);
    });
};

BasicType.prototype.setupRoute = function(callback) {
    var that = this;
    this.params.globals.apps.express.use('/' + this.params.typeNodeId + '/:tipId', function (req, res, next) {
        that.handleBasicRoute(req, res, next);
    });

    this.params.globals.apps.express.use('/' + this.params.typeNodeId + '/:tipId', function (req, res, next) {
        if(typeof req.skipTypeRoute !== "undefined")  {
            //console.log('req.skipTypeRoute:', req.skipTypeRoute);
            //console.log('route:', '/' + that.params.typeNodeId + req.params.tipId);
            return next();
        }
        that.handleRoute(req, res, next);
    });
    if(typeof callback !== "undefined") {
        callback();
    }
};

BasicType.prototype.handleBasicRoute = function(req, res, next) {
    var that = this;

    var command = req.body.command;

    var commandHandler = {
        'relayServerTip': function (data) {
            var tipId = req.params.tipId;
            console.log('tipId:', tipId);
            async.waterfall([
                function (callback) {
                    if (typeof that.params.globals.allTips[tipId] === "undefined") {
                        console.log("Inside basicType: handleBasicRoute ");
                        return that.awakenServerTip(tipId, callback);
                    }
                    callback(null);
                }
            ], function (error) {
                if (error) {
                    return res.send(JSON.stringify({error: 1, errorInfo: error}));
                }
                req.skipTypeRoute = 1;
                next();
            });
        },
        'addNewEdge': function(data) {
            that.addNewEdge(data, function(error, edgeData){
                if(error) {
                    return res.send(JSON.stringify({error: 1, errorInfo: error}));
                }
                res.send(JSON.stringify({error: 0}));
            });
        },
        'removeEdge': function(data) {
            that.params.oxygenLib.removeEdge(data.nodeString, data.edgeString, function(error, edgeData) {
                if (error) {
                    return res.send(JSON.stringify({error: 1, errorInfo: error}));
                }
                res.send(JSON.stringify({error: 0}));
            });
        },
        'leftMenuClick': this.handleLeftMenuClick.bind(this, req, res),
        'addNewPermission': function(data) {
            that.addNewPermission(data, function(error, permissionItem){
                if(error) {
                    return res.send(JSON.stringify({error: 1, errorInfo: error}));
                }
                res.send(JSON.stringify({permission: permissionItem}));
            });
        },
        'generateGDN': function(data) {
            that.params.oxygenLib.createGDN(data, function(error, gdn){
                if(error) {
                    return res.send(JSON.stringify({error: 1, errorInfo: error}));
                }
                res.send(JSON.stringify({gdn: gdn}));
            });
        },
        'getGUID': function(data) {
            that.params.oxygenLib.getGUID(function(error, guid){
                if(error) {
                    return res.send(JSON.stringify({error: 1, errorInfo: error}));
                }
                res.send(JSON.stringify({guid: guid}));
            });
        },
        'updateSessionSpokes': this.updateSessionSpokes.bind(this, req, res),
        'resetActiveSession': this.resetActiveSession.bind(this, req, res),
        'getPermissionData': this.getPermissionData.bind(this, req, res)

    };

    var data = (typeof req.body.data !== "undefined") ? (JSON.parse(req.body.data)) : {};
    if(typeof commandHandler[command] !== "undefined") {
        console.log('command:', command);
        commandHandler[command](data);
    }
    else {
        next();
    }
};


BasicType.prototype.handleRoute = function(req, res, next) {
    var that = this;

    var tipId = req.params.tipId;
    var command = req.body.command;

    var commandHandler = {
        'createServerTip': function (data) {
            that.createServerTip(data.templateId, data.templateData || {}, data.tipData || {}, function (error, tipData) {
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
                    that.params.globals.apps.redis.get(tipId, callback);
                },
                function (value, callback) {
                    if (!value) {
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
        }
    };

    var data = (typeof req.body.data !== "undefined") ? (JSON.parse(req.body.data)) : {};
    commandHandler[command](data);
};


BasicType.prototype.createThread = function(rootItem, threadItem, threadTemplateItem, callback) {
    this.params.oxygenLib.addEdge(
        rootItem.Node,
        this.params.oxygenLib.createSimpleOES(
            [
                this.params.config.get('config.encodings.labels.threads'),
                threadItem.Family,
                threadTemplateItem.DisplayName,
                threadItem.DisplayName
            ],
            threadItem.Node
        ),
        callback
    );
};

BasicType.prototype.getLinkedThread = function(accountId, callback) {
    //console.log('BasicType.getLinkedThread-accountId:', accountId);
    this.params.oxygenLib.getEdges(
        accountId,
        this.params.oxygenLib.createSimplePartialOES(
            [
                this.params.config.get('config.encodings.labels.threads')
            ]
        ), function(error, items){
            if(error) {
                return callback(error);
            }
            if(!items.length) {
                return callback('No thread found');
            }
            callback(error, items[0].endString || {});
        });
};

BasicType.prototype.addNewEdge = function(data, callback) {
    var oesSegments = [
        this.params.config.get('config.encodings.labels.resources'),
        data.info.threadId
    ];

    for(var i in data.parentList) {
        oesSegments.push(data.parentList[i]);
    }

    this.params.oxygenLib.addEdge(
        data.info.accountId,
        this.params.oxygenLib.createSimpleOES(
            oesSegments,
            data.id
        ),
        callback
    );
};

BasicType.prototype.addNewPermission = function(data, mCallback) {
    var permissionAttributes = {
        AllowedToAccount: data.info.accountItem.Node,
        AllowedToDN: data.info.accountItem.DisplayName,
        InThread: data.info.threadItem.Node,
        InThreadDN: data.info.threadItem.DisplayName,
        OnObject: data.id,
        OnObjectDN: data.displayName || '',
        //UsingView: "",
        FromPermissionNodes: 0,
        AllowedByAccount: 0,
        RoleInObject: data.roleInObject,
        RoleInThread: data.roleInThread,
        Grants: data.info.grants
    };

    var that = this;
    async.waterfall([
        this.params.oxygenLib.getGUID.bind(this.params.oxygenLib),
        function(guid, callback) {
            that.params.oxygenLib.getTip(data.id, function(error, tipItem){
                callback(error, guid, tipItem);
            });
        },
        function(guid, tipItem, callback) {
            that.params.oxygenLib.getTipFTT(data.id, function(error, FTT){
                callback(error, guid, tipItem, FTT);
            });
        },
        function(guid, tipItem, FTT, callback) {
            if(typeof data.viewId !== "undefined") {
                permissionAttributes.UsingView = data.viewId;
                return callback(null, guid, FTT);
            }
            that.params.oxygenLib.getLinkedEdges(tipItem.Type, that.params.config.get('config.encodings.labels.views'), function(error, edges) {
                if(!error && edges.length > 0) {
                    permissionAttributes.UsingView = edges[0];
                }
                callback(error, guid, FTT);
            });
        },
        function(guid, FTT, callback) {

            permissionAttributes.OnObjectFTT = FTT;

            if(typeof data.parentList !== "undefined") {
                var oesSegments = [
                    that.params.config.get('config.encodings.labels.resources'),
                    data.info.threadItem.Node
                ];

                for (var i in data.parentList) {
                    oesSegments.push(data.parentList[i]);
                }

                var edgePath = that.params.oxygenLib.createSimpleOES(
                    oesSegments,
                    guid
                );
                that.params.oxygenLib.addPermission(guid, permissionAttributes, edgePath, callback);
            }
            else {
                that.params.oxygenLib.addPermission(guid, permissionAttributes, callback);
            }
        }
    ], mCallback);
};

BasicType.prototype.getClientTipData = function(clientData, mCallback) {
    var that = this;
    async.waterfall([
        function(callback) {
            if(typeof clientData.viewTemplate === "undefined") {
                that.params.oxygenLib.getLinkedEdges(that.params.typeNodeId, that.params.config.get('config.encodings.labels.views'), function (error, edges) {
                    if (error) {
                        return callback(error);
                    }
                    if ((typeof edges === "undefined") || edges.length == 0) {
                        return callback("View not found");
                    }
                    clientData.viewTemplate = edges[0];
                    callback(null);
                });
            }
            else {
                callback(null);
            }

        },
        function(callback){
            that.params.oxygenLib.getTemplate(clientData.viewTemplate, callback);
        },
        function(templateItem, callback) {
            if(templateItem.Node == templateItem.RootTemplate) {
                return callback(null, templateItem, templateItem);
            }
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
            that.params.oxygenLib.getTip(clientData.threadId, function(error, threadItem) {
                callback(error,templateItem, rootTemplateItem, typeItem, threadItem );
            });
        },
        function(templateItem, rootTemplateItem, typeItem, threadItem, callback) {
            that.params.oxygenLib.getTip(clientData.serverNodeId, function(error, item) {
                callback(error,templateItem, rootTemplateItem, typeItem, threadItem, item );
            });
        },
        function(templateItem, rootTemplateItem, typeItem, threadItem, item, callback) {
            that.params.oxygenLib.getTip(clientData.sessionId, function(error, sessionItem) {
                callback(error,templateItem, rootTemplateItem, typeItem, threadItem, item, sessionItem );
            });
        },
        function(templateItem, rootTemplateItem, typeItem, threadItem, item, sessionItem, callback) {
            that.params.oxygenLib.getTip(clientData.accountId, function(error, accountItem) {
                callback(error,templateItem, rootTemplateItem, typeItem, threadItem, item, sessionItem, accountItem );
            });
        }

    ],function(error, templateItem, rootTemplateItem, typeItem, threadItem, item, sessionItem, accountItem) {
        if(error) {
            console.log('getClientTipData-error:', error);
        }
        var retObj = {
            template: templateItem || {},
            type: typeItem || {},
            rootTemplate: rootTemplateItem,
            roleInObject: clientData.roleInObject,
            roleInThread: clientData.roleInThread,
            threadItem: threadItem,
            serverItem: item,
            sessionItem: sessionItem,
            accountItem: accountItem
        };
        //console.log('retObj:', retObj);
        mCallback(error, retObj);
    });
};

BasicType.prototype.handleLeftMenuClick = function(req, res, data) {
    var that = this;
    //console.log('handleLeftMenuClick-data:', data);
    async.waterfall([

        this.params.oxygenLib.getPermission.bind(this.params.oxygenLib, data.nodeId),
        function(permissionItem, callback) {
            var itemId = permissionItem.OnObject;

            if (typeof that.params.globals.allTips[itemId] === "undefined") {
                return that.params.oxygenLib.awakenServerTip(itemId, function (error) {
                    callback(error, itemId);
                }, true);
            }
            else {
                callback(null, itemId);
            }
        }
    ],function(error, itemId) {
        if(error) {
            console.log('handleLeftMenuClick-error:', error);
            return res.send(JSON.stringify({error: 1, errorData: error}));
        }

        that.params.globals.allTips[itemId].handleLeftMenuClick(req, res, data);

    });
};

BasicType.prototype.updateSessionSpokes = function(req, res, data) {
    var that = this;

    async.waterfall([
        function(callback) {
            if(typeof data.spokeId !== "undefined" && data.spokeId) {
                callback(null, data.spokeId);
            }
            else {
                that.params.oxygenLib.getGUID(callback);
            }
        },
        function(guid, callback){
            var properties = {
                Node: guid,
                Edge: that.params.config.get('config.dynamodb.fixedValues.attributesEdge'),
                Relation: data.panelStatus,
                Account: data.accountId,
                Session: data.sessionId,
                InThread: data.threadId,
                OnObject: data.objectId,
                UsingView: data.viewId
            };

            that.params.oxygenLib.addActiveSessionsSpoke1(properties, callback);
        },
        function(spoke1Item, callback) {
            var properties = {
                Node: spoke1Item.Node,
                Edge: that.params.config.get('config.dynamodb.fixedValues.attributesEdge'),
                Relation: data.panelStatus,
                Tab: data.tabId
            };
            that.params.oxygenLib.addActiveSessionsSpoke2(properties, function(error, spoke2Item){
                callback(error, spoke1Item, spoke2Item);
            });
        }
    ], function(error, spoke1Item, spoke2Item){
        if (error) {
            return res.send(JSON.stringify({error: 1, errorInfo: error}));
        }
        res.send(JSON.stringify({data: spoke1Item}));
    });
};

BasicType.prototype.resetActiveSession = function(req, res, data) {
    var that = this;
    async.waterfall([
        function(callback) {
            that.params.oxygenLib.markActiveSessionsSpokesInactive(data.sessionId, callback);
        }
    ], function(error){
        if(error) {
            return res.send(JSON.stringify({error:1, errorInfo: error}));
        }
        res.send(JSON.stringify({}));
    });
};

BasicType.prototype.getPermissionData = function(req, res, data) {
    this.params.oxygenLib.getPermission(data.id, function(error, permissionItem){
        if(error) {
            return res.send(JSON.stringify({error:1, errorInfo: error}));
        }
        res.send(JSON.stringify({data: permissionItem}));
    });
};


BasicType.prototype.sendClientTipData = function(error, res, viewData) {
    var that = this;
    if (error) {
        return res.send(JSON.stringify({error: 1, errorInfo: error}));
    }
    else if (typeof viewData === "undefined") {
        return res.send(JSON.stringify({error: 1, errorInfo: 'Not compatible views found'}));
    }
    async.waterfall([
        this.params.oxygenLib.getGUID.bind(this.params.oxygenLib),
        function(guid, callback) {
            var options  = {
                GUID: guid,
                Type: 'Simple',
                Prefix: viewData.serverItem.DisplayName + '-viewer'
            };
            that.params.oxygenLib.createGDN(options, function(error, gdn){
                callback(error, guid, gdn);
            })
        }
    ], function(error, guid, gdn){
        if(error) {
            return res.send(JSON.stringify({error: 1, errorInfo: error}));
        }
        console.log('viewData:', viewData);
        res.send(
            JSON.stringify(
                {
                    panelType: viewData.rootTemplate.Code.PanelName,
                    initData: {
                        typeNodeId: viewData.serverItem.Type,
                        serverNodeId: viewData.serverItem.Node,
                        threadItem: viewData.threadItem,
                        template: viewData.template.Code,
                        roleInObject: viewData.roleInObject,
                        roleInThread: viewData.roleInThread,
                        clientNodeId: guid,
                        panelName: gdn,
                        accountItem: viewData.accountItem,
                        sessionItem: viewData.sessionItem
                    }
                }
            )
        );
    });
};

module.exports = BasicType;