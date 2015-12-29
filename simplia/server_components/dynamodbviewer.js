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

function DynamodbViewer(params, callback) {
   //Calling base constructor

    this.contentType = "text/html; charset=UTF-8";
    BasicServerComponent.call(this, params, callback || undefined);
}

//Inheriting from the base object
util.inherits(DynamodbViewer, BasicServerComponent);

DynamodbViewer.prototype.init = function(mCallback) {
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

DynamodbViewer.prototype.handleRoute = function(req, res, next) {
    var that = this;

    var command = {
        'getcolumndata': that.getColumnData.bind(this, req, res),
        'gettabledata': that.getTableData.bind(this, req, res)
    };

    var data = JSON.parse(req.body.data);
    command[data.command](data || {});
};

DynamodbViewer.prototype.getTableData = function(req, res, data) {
    var that = this;
    var metatype = data.metatype || this.context.metatype || "metatype";
    async.waterfall([
        this.params.oxygenLib.getMetaTypes.bind(this, metatype)
    ], function(error, items){
        if(error) {
            return res.send(JSON.stringify({error: 1, errorInfo: error}))
        }
        res.send(JSON.stringify({data: items}));
        if(metatype != that.context.metatype) {
            var context = {metatype: metatype};
            that.params.oxygenLib.updateTipContext(that.nodeId, context, function (error) {
                that.context = context;
            });
        }
    });
};

DynamodbViewer.prototype.getColumnData = function(req, res, data){
    this.params.oxygenLib.getMetadata(
        this.params.config.get('config.dynamodb.tables.components.tableName'),
        this.params.config.get('config.dynamodb.tables.components.metatdataUpdateTime'),
        function(error, data) {
            if(error) {
                return res.send(JSON.stringify({error:1, errorInfo: error}));
            }
            //console.log('data:', data);
            var columns = [];
            //for(var i in data.Item.SchemaList) {
            for(var i = 0; i < 5; i++ ) {
                console.log('Name:', data.Item.SchemaList[i].Name);
                columns.push(data.Item.SchemaList[i].Name);
            }
            console.log('columns:', columns);
            return res.send(JSON.stringify({columns: columns, primaryKeys: ['Node', 'Edge']}));
        }
    )
};

DynamodbViewer.prototype.refreshPanel = function(req, res, data) {
    this.getTableData(req, res, {metatype: this.context.metatype});
};

module.exports = DynamodbViewer;