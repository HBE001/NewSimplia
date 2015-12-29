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

function Mogopak(params, callback) {
   //Calling base constructor
    BasicServerComponent.call(this, params, callback || undefined);
}

//Inheriting from the base object
util.inherits(Mogopak, BasicServerComponent);

Mogopak.prototype.init = function(mCallback) {
    var that = this;
    async.waterfall([
        function(callback) {
            BasicServerComponent.prototype.init.call(that, callback);
        }
    ], function(error){
        if(error) {
            console.log('oxygencatalog-init-error:', error);
        }
        if(typeof mCallback !== "undefined") {
            mCallback();
        }

    });
};

Mogopak.prototype.handleRoute = function(req, res, next) {
    var that = this;

    var command = {
        'savemogopakpage': function(data) {
            that.saveMogopakPage(req, res, data.data);
        },
        'getsignedurl': this.getSignedUrl.bind(this, req, res),
        'publishMogopak': this.publishMogopak.bind(this, req, res)
    };
    var data = JSON.parse(req.body.data);
    command[data.command](data || {});
};

Mogopak.prototype.saveMogopakPage = function(req, res, data) {
    var mogopakName = data['Project Name'] + "_" + data['Page Number'];
    var that = this;
    async.waterfall([
        this.params.globals.typeServers[this.params.config.get('config.nodeIds.types.mogopakpage.id')].createServerTip.bind(
            this,
            this.params.config.get('config.nodeIds.templates.basicmogopak.id'),
            {},
            {
                DisplayName: mogopakName,
                ExtendedAttributes: { MogopakName: mogopakName }
            }
        ),
        function(tipItem, callback) {
            that.params.oxygenLib.awakenServerTip(tipItem.Node, function(error){
                callback(error, tipItem);
            });
        },
        function(tipItem, callback) {
            that.params.globals.allTips[tipItem.Node].getUploadSignedUrl({mogopakName: mogopakName}, function(error, urlParams, contentType){
                if(error) {
                    console.log('getSignedUrl-error:', error);
                }
                callback(error, urlParams, tipItem);
            });
        }
    ], function(error, urlParams, tipItem){
        if(error) {
            return res.send(JSON.stringify({error:1, errorInfo: error}));
        }
        res.send(JSON.stringify({url: urlParams.url, id: tipItem.Node, contentType: urlParams.contentType, mogopakName: urlParams.name}));
    });
};

Mogopak.prototype.getSignedUrl = function(req, res, data) {
    this.params.oxygenLib.getS3SignedUrl(data.id, function(error, url){
        if(error) {
            return res.send(JSON.stringify({error:1, errorInfo: error}));
        }
        res.send(JSON.stringify({url: url}));
    });
};

Mogopak.prototype.publishMogopak = function(req, res, data) {
    var that = this;
    this.params.oxygenLib.updateS3ObjectACL(data.id, 'public-read', function(error){
        if(error) {
            return res.send(JSON.stringify({error:1, errorInfo: error}));
        }
        res.send(JSON.stringify({url: that.params.config.get('config.s3.urlPrefix') + data.id}));
    });
};

module.exports = Mogopak;