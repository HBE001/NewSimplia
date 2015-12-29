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

module.exports = function(app, config) {
    AWS.config.update(config.get('config.aws.awsRegion'));
    var awsClient = new AWS.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);

    app.post('/metadata/getschema', function(req, res){
        if((typeof req.body.tableName === "undefined") || (typeof req.body.updateTime === "undefined")) {
            return res.send(JSON.stringify({error: "Invalid input"}));
        }

        var tableName = req.body.tableName;
        var updateTime = req.body.updateTime;

        var params = {
            TableName: config.get('config.dynamodb.tables.metadata.tableName'),
            Key: {
                TableName: tableName,
                UpdateTime: updateTime
            }
        };

        console.log('getItem-params:', params);
        docClient.getItem(params, function(error, itemData){
            if(error) {
                console.log('getItem-error:', error);
                return res.send(JSON.stringify({error: error}));
            }
            else if((typeof itemData.Item === "undefined") || (typeof itemData.Item.SchemaList === "undefined")) {
                return res.send(JSON.stringify({error: "Couldn't find the data attribute"}));
            }
            res.send(JSON.stringify({data: itemData.Item.SchemaList}));
        });
    });

    app.post('/metadata/save', function(req, res){
        if((typeof req.body.tableName === "undefined") || (typeof req.body.data === "undefined")) {
            return res.send(JSON.stringify({error: "Invalid input"}));
        }

        console.log('req-body:', req.body);
        var tableName = req.body.tableName;
        var tableData = JSON.parse(req.body.data);

        console.log('tableData:', tableData);
        var params = {
            TableName: tableName,
            Item: tableData
        };

        docClient.putItem(params, function(error){
            if(error) {
                console.log('getItem-error:', error);
                return res.send(JSON.stringify({error: error}));
            }
            res.send(JSON.stringify({}));
        })
    });
};