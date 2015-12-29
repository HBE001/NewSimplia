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

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var WebSocketServer = require('ws').Server;
var BasicServerComponent = require('./../lib/basicservercomponent');
var util = require('util');
var async = require('async');
var fs = require('fs');
var express = require('express');

function OxygenHome(params, callback) {
    params.homeThread = this;

    //Calling base constructor
    BasicServerComponent.call(this, params, callback || undefined);
}

//Inheriting from the base object
util.inherits(OxygenHome, BasicServerComponent);

OxygenHome.prototype.init = function(mCallback) {
    var that = this;
    async.waterfall([
        function(callback) {
            BasicServerComponent.prototype.init.call(that, callback);
        },
        that.setupExpress.bind(that),
        that.setupWebsocket.bind(that),
        function(callback) {
            that.params.oxygenLib.awakenServerTip(that.params.config.get('config.nodeIds.tips.oxygencatalog'), callback, true);
        },
        function(callback) {
            that.params.oxygenLib.awakenServerTip(that.params.config.get('config.nodeIds.tips.mogopak'), callback, true);
        }
    ], function(error){
        if(error) {
            console.log('oxygenhome-init-error:', error);
        }
        if(typeof mCallback !== "undefined") {
            mCallback();
        }

    });
};

OxygenHome.prototype.setupExpress = function(mCallback) {
    //console.log('setting up express');
    var that = this;
    async.waterfall([
        this.addExpressMiddleware.bind(this),
        this.loadTypeServers.bind(this),
        this.addMainExpressRoute.bind(this),
        this.loadBasicRoutes.bind(this),
        function(callback) {
            that.expressServer = that.params.globals.apps.express.listen(that.params.config.get('config.express.serverPort'), callback);
        }
    ], function(error){
        if(error) {
            console.log('setupExpress-error:', error);
        }
        mCallback(error);
    });
};

OxygenHome.prototype.loadBasicRoutes = function(callback) {
    //Loading the basic routes
    //require('./../routes')(this.params);
    this.params.globals.apps.express.use('/docs/', express.static(__dirname + '/../out'));
    this.params.globals.apps.express.use('/js', express.static(__dirname + '/../js'));
    this.params.globals.apps.express.use('/css', express.static(__dirname + '/../css'));
    this.params.globals.apps.express.use('/img', express.static(__dirname + '/../img'));
    this.params.globals.apps.express.use('/panels', express.static(__dirname + '/../panels'));

    this.params.globals.apps.express.use(express.static(__dirname + '/../htm'));

    var that = this;
    this.params.globals.apps.express.post(this.params.config.get('config.express.routes.config'), function(req, res){
        res.send(JSON.stringify(that.params.config.get('config')));
    });

    callback();
};

OxygenHome.prototype.loadTypeServers = function(callback) {
    var that = this;
    this.params.oxygenLib.getMetaTypes(this.params.config.get('config.dynamodb.metatypes.type'), function(error, typeItems){
        if(error) {
            console.log('loadtypeservers-getmetattypes-error:', error);
            return callback(error);
        }
        async.each(typeItems, function(typeItem, eCallback){
            if((typeof typeItem.Code !== "undefined") && (typeof typeItem.Code.TypeServer !== "undefined")) {
                //var typeServer = require(typeItem.Code.TypeServer);
                //console.log("typeItem = ", typeItem);
                var typeServer = require(typeItem.Code.TypeServer.replace("/usr/local/apps/simplia/", "../"));
                var typeParams = {typeNodeId: typeItem.Node, typeItem: typeItem};
                var typeServerObj = new typeServer(util._extend(typeParams, that.params), function(error){
                    if(error) {
                        console.log('loadtypeservers-each-error:', error);
                    }
                    eCallback();
                });
                that.params.globals.typeServers[typeItem.Node] = typeServerObj;
            }
            else {
                eCallback();
            }
        }, function(error){
            if(error) {
                console.log('loadtypeservers-error:', error);
            }
            callback();
        });
    });
};

OxygenHome.prototype.setupWebsocket = function(callback) {
    this.wss = new WebSocketServer({server: this.expressServer});
    this.wss.on('connection', function (ws) {
        ws.on('message', function (data, flags) {

            var dataObj = JSON.parse(data);

            var command = {
                'panel-movement-data': function(data, ws) {
                    //return handlePanelMovementEvent(data, ws);
                },
                'gettreedata': function(data, ws) {
                    //return getTreeData(data, ws);
                },
                'keepalive': function() {
                    return '';
                }
            };
            //console.log('dataObj:',dataObj);
            return command[dataObj.command || dataObj.type](dataObj.data || {}, ws);
        });
    });
    if(typeof callback !== "undefined") {
        callback();
    }
};

OxygenHome.prototype.addExpressMiddleware = function(callback) {
    this.params.globals.apps.express.use(cookieParser());
    this.params.globals.apps.express.use(session({
        store: new RedisStore({
            host: this.params.config.get('config.redis.redisServer'),
            port: this.params.config.get('config.redis.redisServerPort')
        }),
        secret: '1234567890QWERTY',
        saveUninitialized: true,
        resave: true,
        cookie: {domain: this.params.config.get('config.cookies.data.domain')}
    }));
    this.params.globals.apps.express.use(bodyParser.json({limit: this.params.config.get('config.express.sizeLimit')}));
    this.params.globals.apps.express.use(bodyParser.urlencoded({
        limit: this.params.config.get('config.express.sizeLimit'),
        extended: true
    }));
    if(typeof callback !== "undefined") {
        callback();
    }
};

OxygenHome.prototype.addMainExpressRoute = function(mCallback) {
    var that = this;

    var userIdCookieName = this.params.config.get('config.cookies.names.userId');

    this.params.globals.apps.express.get(this.params.config.get('config.express.routes.main'), function (req, res) {
        var validUserId = typeof req.cookies[userIdCookieName] !== "undefined";

        if(validUserId) {
            that.setupAnonymousRevisit(req, res, req.cookies[userIdCookieName]);
        }
        else {
            that.setupAnonymousVisit(req, res);
        }
    });

    this.params.globals.apps.express.post(this.params.config.get('config.express.routes.main'), function (req, res) {
        var validUserId = typeof req.cookies[userIdCookieName] !== "undefined";

        if (typeof req.body[that.params.config.get('config.cookies.names.commandData')] !== "undefined") {
            that.setCookie(res, that.params.config.get('config.cookies.names.commandData'), req.body[that.params.config.get('config.cookies.names.commandData')]);
        }

        if(validUserId) {
            that.setupAnonymousRevisit(req, res, req.cookies[userIdCookieName]);
        }
        else {
            that.setupAnonymousVisit(req, res);
        }
    });

    if(typeof mCallback !== "undefined") {
        mCallback();
    }
};

OxygenHome.prototype.setupAnonymousRevisit = function(req, res, accountId) {
    var that = this;
    async.waterfall([
        function(callback) {
            that.params.oxygenLib.getTip(accountId, callback);
        },
        function(accountItem, callback){
            that.awakenAnonymousAccount(accountItem, function(error){
                callback(error, accountItem);
            });
        },
        function(accountItem, callback){
            that.awakenAnonymousThread(accountItem, callback);
        }
    ], function(error){
        if(error) {
            console.log('index.html-error:', error);
            return res.send();
        }
        var page = fs.readFileSync(__dirname + '/../htm/index.html', 'utf8');
        res.send(page);
    });
};

OxygenHome.prototype.setupAnonymousVisit = function(req, res) {
    var that = this;
    async.waterfall([
        function(callback) {
            that.createAnonymousAccount(req, callback);
        },
        function(accountItem, callback) {
            that.createAnonymousThread(accountItem, function(error, threadItem){
                callback(error, accountItem, threadItem);
            });
        },
        function(accountItem, threadItem, callback) {
            that.addAnonymousAccountPermission(accountItem, threadItem, function(error){
                callback(error, accountItem, threadItem);
            });
        },
        function(accountItem, threadItem, callback){
            that.awakenAnonymousAccount(accountItem, function(error){
                callback(error, accountItem, threadItem);
            });
        },
        function(accountItem, threadItem, callback){
            that.params.globals.typeServers[threadItem.Type].awakenServerTip(threadItem.Node, function(error){
                callback(error, accountItem);
            });
        }
    ], function(error, accountItem) {
        if(error) {
            console.log('index.html-error:', error);
            return res.send()
        }
        //console.log('index.html-res: accountItem:', accountItem);
        that.setCookie(res, that.params.config.get('config.cookies.names.userId'), accountItem.Node);
        var page = fs.readFileSync(__dirname + '/../htm/index.html', 'utf8');
        res.send(page);
    });
};


OxygenHome.prototype.awakenAnonymousThread = function(accountItem, mCallback) {
    var that = this;
    async.waterfall([
        function(callback){
            that.params.globals.typeServers[accountItem.Type].getLinkedThread(accountItem.Node, callback);
        },
        function(threadId, callback) {
            that.params.oxygenLib.getTip(threadId, callback);
        },
        function(threadItem, callback) {
            that.params.globals.typeServers[threadItem.Type].awakenServerTip(threadItem.Node, callback);
        }
    ], mCallback);
};

OxygenHome.prototype.awakenAnonymousAccount = function(accountItem, callback) {
    //console.log('params:', this.params);
    //console.log('globals:', this.params.globals);
    this.params.globals.typeServers[accountItem.Type].awakenServerTip(accountItem.Node, callback);
};

OxygenHome.prototype.createAnonymousAccount = function(req, mCallback) {
    var that = this;
    var anonymousAccountTemplateId = this.params.config.get('config.nodeIds.templates.anonymousaccount.server');
    async.waterfall([
        this.params.oxygenLib.getTemplate.bind(this.params.oxygenLib, anonymousAccountTemplateId),
        function(templateItem, callback) {
            var options = {
                Prefix: that.getIP(req),
                GUID: that.params.oxygenLib.getGUIDSync(),
                Type: 'Simple'
            };
            that.params.oxygenLib.createGDN(options, function(error, gdn){
                callback(error, templateItem, options.GUID, gdn);
            });
        },
        function(templateItem, guid, gdn, callback) {
            that.params.globals.typeServers[templateItem.Type].createServerTip(anonymousAccountTemplateId, {}, {Node: guid, DisplayName: gdn}, {}, req, callback);
        }
    ], mCallback);
};

OxygenHome.prototype.createAnonymousThread = function(accountItem, mCallback) {
    var that = this;
    var anonymousThreadTemplateId = this.params.config.get('config.nodeIds.templates.anonymousthread.server');

    async.waterfall([
        this.params.oxygenLib.getTemplate.bind(this.params.oxygenLib, anonymousThreadTemplateId),
        function(threadTemplateItem, callback) {
            that.params.globals.typeServers[threadTemplateItem.Type].createServerTip(anonymousThreadTemplateId, {}, { DisplayName: accountItem.DisplayName}, function(error, threadItem){
                callback(error, threadItem, threadTemplateItem);
            });
        },
        function(threadItem, threadTemplateItem, callback) {
            that.params.globals.typeServers[accountItem.Type].createThread(accountItem, threadItem, threadTemplateItem, function(error){
                callback(error, threadItem, threadTemplateItem);
            });
        },
        function(threadItem, threadTemplateItem, callback) {
            that.params.oxygenLib.addEdge(
                that.nodeId,
                that.params.oxygenLib.createSimpleOES(
                    [
                        that.params.config.get('config.encodings.labels.threads'),
                        threadItem.Family,
                        threadTemplateItem.DisplayName,
                        threadItem.DisplayName
                    ],
                    threadItem.Node
                ),
                function(error) {
                    callback(error, threadItem);
                }
            );
        }
    ], mCallback);
};

OxygenHome.prototype.addAnonymousAccountPermission = function(accountItem, threadItem, mCallback) {
    var accountPermissionAttributes = {
        AllowedToAccount: accountItem.Node,
        AllowedToDN: accountItem.DisplayName || "",
        InThread: threadItem.Node,
        InThreadDN: threadItem.DisplayName || "",
        OnObject: accountItem.Node,
        OnObjectFTT: this.params.oxygenLib.createSimpleOES([
            this.params.config.get('config.dynamodb.families.resources.name'),
            this.params.config.get('config.dynamodb.families.resources.types.anonymousaccount.name'),
            this.params.config.get('config.dynamodb.families.resources.types.anonymousaccount.rootTemplates.anonymousaccount.name')
        ]),
        OnObjectDN: accountItem.DisplayName || "",
        UsingView: "",
        FromPermissionNodes: 0,
        AllowedByAccount: 0,
        RoleInObject: this.params.config.get('config.roles.anonymousUser'),
        RoleInThread: this.params.config.get('config.roles.anonymousUser'),
        Grants: 0
    };

    console.log('accountPermissionAttributes:', accountPermissionAttributes);

    var that = this;
    async.waterfall([
        this.params.oxygenLib.getLinkedEdges.bind(this.params.oxygenLib, accountItem.Type, this.params.config.get('config.encodings.labels.views')),
        function(edges, callback) {
            if ((typeof edges === "undefined") || edges.length == 0) {
                return callback('view not found');
            }
            accountPermissionAttributes.UsingView = edges[0];
            console.log('accountPermissionAttributes-updated:', accountPermissionAttributes);
            that.params.oxygenLib.getGUID(callback);
        },
        function(guid, callback) {
            that.params.oxygenLib.addPermission(guid, accountPermissionAttributes, function(error, permissionItem){
                if(error) {
                    console.log('addAnonymousAccountPermission-error:', error);
                }
                console.log('anonymousAccountPermission:', permissionItem);
                callback(error);
            });
        }
    ], mCallback);
};

OxygenHome.prototype.getIP = function(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

var handlePanelMovementEvent = function(data) {
    wss.clients.forEach(function each(client){
        client.send(JSON.stringify({panelname: data.panelname, data:data}))
    });
};

var getTreeData = function(data, ws) {
    var params = {
        TableName: config.get('config.dynamodb.tables.accounts.tableName'),
        Select: 'ALL_ATTRIBUTES',
        ScanIndexForward: true,
        KeyConditions: {
            Node: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [
                    {
                        S: data.username
                    }
                ]
            }
        }
    };
    dynamodb.query(params,function(err, queryData){
        if(err) {
            console.log(err, err.stack);
        }
        else {
            console.log(queryData);
            ws.send(JSON.stringify({callback: data.callback, data: queryData}));
        }
    });
};

module.exports = OxygenHome;