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
var mime = require('mime');

function BasicFile(params, callback) {
   //Calling base constructor
    BasicServerComponent.call(this, params, callback || undefined);
}

//Inheriting from the base object
util.inherits(BasicFile, BasicServerComponent);

BasicFile.prototype.init = function(mCallback) {
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

BasicFile.prototype.getSignedUrl = function(fileData, callback) {
    var params = {
        Bucket: this.params.config.get('config.s3.bucket'),
        Key: this.nodeId,
        ContentType: fileData.type,
        ACL: "public-read"
        /*
        ,
        Metadata: {
            Filename: fileData.name
        }
        */

    };
    //console.log('getSignedUrl-params:', params);
    this.params.globals.apps.s3.getSignedUrl('putObject', params, callback);
};

BasicFile.prototype.uploadFile = function(fileData, callback) {
    var params = {
        Bucket: this.params.config.get('config.s3.bucket'),
        Key: this.nodeId,
        Body: fileData.data,
        ACL: "public-read",
        ContentType: mime.lookup(this.tip.ExtendedAttributes.FileName)
    };

    this.params.globals.apps.s3.upload(params, function(err, data){
        console.log('s3-upload-error:',err, 's3-upload-data:', data);
        callback(err);
    });
};

BasicFile.prototype.getLeftMenuClickReturnParams = function(callback) {
    callback(null, {
        fileUrl: this.params.config.get('config.s3.urlPrefix') + this.nodeId
    });
};

module.exports = BasicFile;