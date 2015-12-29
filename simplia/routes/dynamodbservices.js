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
var doc = require('dynamodb-doc');
var AWS = require('aws-sdk');
var BL = require('./../lib/baselib.js'), baselib;

module.exports = function(app, config) {
    AWS.config.update(config.get('config.aws.awsRegion'));
    var awsClient = new AWS.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);
    baselib = new BL(config);

    app.post('/dyndb/save', function(req, res){
        var params = req.body;
        var tableName = params.tableName;

        delete params['tableName'];

        var putItemParams = {
            Item: createBasicItemAttributes(),
            TableName: tableName
        };

        for(var i in params) {
            putItemParams.Item[i] = params[i];
        }
        console.log('item:', putItemParams);
        docClient.putItem(putItemParams,function(err, data) {
            if (err) {
                console.log('put-item-error', err, err.stack);
                return res.send({error: 1, msg: "Error occurred in saving!"});
            }
            res.send({error: 0, msg: "Success!"});
        });
    });

    app.post('/dyndb/getdata', function(req, res){
        console.log('body:',req.body);
        var callback = function(err, nodeData) {
            if(err) {
                return res.send({error:1});
            }
            res.send(JSON.stringify({error: 0, data: nodeData}));
        };
        var method = {
            'getitem': getDynDBItem.bind(null, req.body.tableName, req.body.key, callback),
            'query': queryDynDB.bind(null, req.body.tableName, req.body.indexName, req.body.conditions, callback)
        };
        method[req.body.dataMethod]();
    });

    var createBasicItemAttributes = function() {
        var item = {};
        item[config.get('config.dynamodb.tables.accounts.hashKey')] = baselib.getNodeId();
        item[config.get('config.dynamodb.tables.accounts.rangeKey')] = config.get('config.dynamodb.fixedValues.attributesEdge');
        item[config.get('config.dynamodb.tables.accounts.sectorCode')] = config.get('config.nodeId.sectorId');
        item[config.get('config.dynamodb.tables.accounts.updateTime')] = baselib.getCurrentTime();

        return item;
    };

    var getDynDBItem = function (tableName, key, cb) {
        var params = {
            TableName: tableName,
            Key: key
        };

        docClient.getItem(params, function (err, nodeData) {
            if (err) {
                console.log('getitem-error', err, err.stack, nodeData);
            }
            console.log('data', nodeData);
            cb(err, nodeData);
        });
    };

    var queryDynDB = function(tableName, indexName, conditions, cb) {
        var params = {
            TableName: tableName,
            IndexName: indexName,
            KeyConditions: []
        };
        for(var i in conditions) {
            params.KeyConditions.push(docClient.Condition(conditions[i][0],conditions[i][1],conditions[i][2]));
        }
        console.log(params);
        docClient.query(params, function (err, nodeData) {
            if (err) {
                console.log('query-error', err, err.stack, nodeData);
            }
            console.log('nodeData',nodeData);
            cb(err, nodeData);
        });

    }

};