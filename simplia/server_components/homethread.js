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

function HomeThread(params, callback) {
    //Calling base constructor
    BasicServerComponent.call(this, params, callback || undefined);
}

//Inheriting from the base object
util.inherits(HomeThread, BasicServerComponent);

HomeThread.prototype.init = function(callback) {
    var that = this;
    BasicServerComponent.prototype.init.call(this, function(){
        if(typeof callback !== "undefined") {
            callback();
        }
    });
};


HomeThread.prototype.handleRoute = function(req, res, next) {
    console.log('HomeThread.handleRoute');
    var that = this;

    var command = {
        'getleftmenu': function(data) {
            that.getLeftMenu(req, res, data);
        },
        'getpanel': function(data) {
            that.getPanel(req, res, data);
        }
    };
    var data = JSON.parse(req.body.data);
    console.log('data:', data);
    command[data.command](data || {});

};

HomeThread.prototype.getLeftMenu = function(req, res, data) {
    var that = this;
    this.params.oxygenLib.getEdges(
        data.accountId,
        this.params.oxygenLib.createSimplePartialOES([
            this.params.config.get('config.encodings.labels.resources'),
            this.nodeId
        ]),
        function(error, edges) {
            if(error) {
                return res.send(JSON.stringify({error:1, errorData: error}));
            }
            var items = [];
            async.each(edges, function(edge, callback) {
                var edgeInfo = {
                    path: edge.segments.slice(2),
                    id: edge.endString,
                    info: {
                        accountId: data.accountId,
                        threadId: that.nodeId,
                        edgeString: edge.edgeString,
                        nodeString: data.accountId
                    }
                };
                items.push(edgeInfo);
                callback();
            }, function(error){
                if(error) {
                    return res.send(JSON.stringify({error: 1, errorData: error}));
                }
                return res.send(JSON.stringify({items: that.params.oxygenLib.createTreeSource(items)}));
            });
        }
    )
};

HomeThread.prototype.getLeftMenuOld = function(req, res, data) {
    var that = this;
    this.params.oxygenLib.getPermissions(
        'thread',
        {},
        {':InThread': this.nodeId, ':AllowedToAccount': data.accountId},
        'AllowedToAccount = :AllowedToAccount',
        function(error, permissions) {
            if(error) {
                return res.send(JSON.stringify({error:1, errorData: error}));
            }
            var permissionsData = [];
            async.each(permissions, function(permission, callback){
                console.log('permission:', permission);
                //Don't include the account itself
                if(permission.OnObject != permission.AllowedToAccount) {
                    that.params.oxygenLib.getTip(permission.OnObject, function(error, tipData) {
                        if (error) {
                            return callback(error);
                        }

                        permissionsData.push({
                            title: tipData.DisplayName,
                            key: permission.Node,
                            permission: permission
                        });
                        callback();
                    })
                }
                else {
                    callback();
                }

            }, function(error){
                if(error) {
                    return res.send(JSON.stringify({error:1, errorData: error}));
                }
                res.send(JSON.stringify(permissionsData));
            });
        }
    );
};


module.exports = HomeThread;
