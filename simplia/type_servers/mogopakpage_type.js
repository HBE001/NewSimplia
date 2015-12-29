/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * © 2010-2015 Lotus Interworks Inc. (“LIW”) Proprietary and Trade Secret.
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
var guid = require('./../lib/guid');
var BasicType = require('./../lib/basictype');
var util = require('util');


function MogopakPageType(params, callback) {
    BasicType.call(this, params, callback);
}

//Inheriting from the base object
util.inherits(MogopakPageType, BasicType);

MogopakPageType.prototype.init = function(callback) {
    var that = this;
    BasicType.prototype.init.call(this, function() {
        that.standardTipData = {};
        if(typeof callback !== "undefined") {
            callback();
        }
    });
};

MogopakPageType.prototype.handleRoute = function(req, res, next) {
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
                    that.params.apps.redis.get(tipId, callback);
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



module.exports = MogopakPageType;