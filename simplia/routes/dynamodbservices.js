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
var aws = require('aws-sdk');
var guid = require('/opt/IDServices/node_modules/guid/index.js');

module.exports = function (app, config) {
    aws.config.update(config.get('aws.awsRegion'));
    var awsClient = new aws.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);

    app.get('/dynamodbservices/AddRow', function (req, res) {
        guid.getGUID(config, function (error, nodeId) {
            console.log(nodeId);
            var params = {
                TableName: "ClientCode",
                Item: {
                    Node: nodeId,
                    Edge: "Self",
                    Name: "Date",
                    Value: "22-5-1989",
                    Tag: "DateTime"
                }
            };

            docClient.putItem(params, function (err, nodeData) {
                if (err) {
                    console.log('Insertion Error', err, err.stack, nodeData);
                    res.send(JSON.stringify({error: 1, errInfo: err, params: params}));
                }
                else {
                    res.send(JSON.stringify({data: nodeData, nodeId: nodeId}));

                }
            });
        });
    });


    app.get('/dynamodbservices/AddRow', function (req, res) {
        var returningJSON = '[{"DynamodbType": "String","Name": "Node","OxygenPType": "ID"},' +
            '{"DynamodbType": "String","Name": "Edge","OxygenPType": "OES"},' +
            '{"DynamodbType": "String","Name": "Name","OxygenPType": "String"},' +
            '{"DynamodbType": "String","Name": "Value","OxygenPType": "String"},' +
            '{"DynamodbType": "String","Name": "Status","OxygenPType": "String"}]";'
        res.send(JSON.stringify({data: ""}));
    });
};