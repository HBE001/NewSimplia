/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * ? 2010-2015 Lotus Interworks Inc. (?LIW?) Proprietary and Trade Secret.
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
//var gdn = require('./../lib/gdn.js');
var gdn = require('/opt/IDServices/node_modules/gdn/index.js');

module.exports = function (app, config) {
    AWS.config.update(config.get('aws.awsRegion'));
    var awsClient = new AWS.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);

    app.post('/metadata/getschema', function (req, res) {
        console.log("==============================");
        console.log("Schema Of = ", req.body.tableName);
        console.log("==============================");

        if ((typeof req.body.tableName === "undefined")) {
            return res.send(JSON.stringify({error: "Invalid input"}));
        }

        var params = {
            TableName: config.get('dynamodb.tables.MetaTable.tableName'),
            KeyConditionExpression: '#key = :value',
            ExpressionAttributeNames: {
                '#key': "TableName"
            },
            ExpressionAttributeValues: {
                ':value': req.body.tableName,
            }
        };

        docClient.query(params, function (error, itemData) {
            if (error) {
                console.log('getItem-error:', error);
                return res.send(JSON.stringify({error: error}));
            }
            else if ((typeof itemData.Items[0] === "undefined") || (typeof itemData.Items[0].SchemaList === "undefined")) {
                return res.send(JSON.stringify({error: "Couldn't find the data attribute"}));
            }
            res.send(JSON.stringify({data: itemData.Items[0].SchemaList}));
        });
    });

    app.post('/metadata/save', function (req, res) {
        if ((typeof req.body.tableName === "undefined") || (typeof req.body.data === "undefined")) {
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

        docClient.putItem(params, function (error) {
            if (error) {
                console.log('PutItem-error:', error);
                return res.send(JSON.stringify({error: error}));
            }
            res.send(JSON.stringify({}));
        })
    });

    app.post('/metadata/open', function (req, res) {
        if ((typeof req.body.tableName === "undefined") || (typeof req.body.data === "undefined")) {
            return res.send(JSON.stringify({error: "Invalid input"}));
        }

        console.log('req-body:', req.body);
        var tableName = req.body.tableName;
        var tableData = JSON.parse(req.body.data);
        console.log('tableData:', tableData);

        gdn.getGUID(tableData.DisplayName, function (data, err) {
            if (data) {
                console.log(data);
                //res.send(JSON.stringify({gdn: data}));
                var params = {
                    TableName: tableName,
                    Key: {
                        Node: data,
                        Edge: tableData.Edge || 'Self'
                        //Edge: tableData.Egde
                    }
                };

                console.log("Get Item Params are: ", params);

                docClient.getItem(params, function (error, nodeData) {
                    if (error) {
                        console.log('getItem-error:', error);
                        return res.send(JSON.stringify({error: error}));
                    }
                    res.send(JSON.stringify({data: nodeData.Item}));
                    console.log("------------------------------------");
                    console.log("Get Item Result");
                    console.log(error);
                    console.log(nodeData);
                    console.log("------------------------------------");
                })

            } else {
                console.log(err);
                res.send(JSON.stringify({error: err}));
            }
        });
    });

    app.post('/metadata/getAllGDN', function (req, res) {
        var params = {
            TableName: req.body.tableName,
            ProjectionExpression: "DisplayName",
            FilterExpression: '#key = :value',
            ExpressionAttributeNames: {
                '#key': "Type"
            },
            ExpressionAttributeValues: {
                ':value': req.body.type,
            }
        };

        docClient.scan(params, function (err, data) {
            if (err) {
                console.log('query-error', err, err.stack, data);
            }
            res.send(JSON.stringify(data.Items));
        });
    });
};
