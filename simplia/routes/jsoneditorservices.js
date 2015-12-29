/**
 * Created by Yahya on 9/9/2015.
 */
var async = require('async');
var aws = require('aws-sdk');
var doc = require("dynamodb-doc");
var guid = require('/opt/IDServices/node_modules/guid/index.js');

module.exports = function (app, config) {
    aws.config.update(config.get('aws.awsRegion'));
    var awsClient = new aws.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);

    var GUIDTempDraft = "2015-10-01T18:47:46.733037Z000-0000Z";
    var GUIDTempFinal = "2015-09-30T09:24:43.129028Z000-0000Z";

    app.post('/jsoneditorservices/openExistingDraft', function (req, res) {
        async.waterfall([
            function (callback) {
                loadJSON(this.config, req, GUIDTempDraft, callback);
            }
        ], function (err, data) {
            res.send(JSON.stringify(data["BFSTTemplateDraft"]));
        });
    });

    app.post('/jsoneditorservices/openExistingFinal', function (req, res) {
        async.waterfall([
            function (callback) {
                loadJSON(this.config, req, GUIDTempFinal, callback);
            }
        ], function (err, data) {
            res.send(JSON.stringify(data["BFSTTemplateFinal"]));
        });
    });

    app.post('/jsoneditorservices/saveAsDraft', function (req, res) {
        if (req.body.nodeGUID != undefined && req.body.nodeGUID != "") {
            async.waterfall([
                function (callback) {
                    updateJSON(this.config, req, callback);
                }
            ], function (err, data) {
                res.send(JSON.stringify({data: data, nodeId: data.Node}));
            });
        } else {
            guid.getGUID(config, function (error, nodeId) {
                console.log(nodeId);
                var params = {
                    TableName: config.get('dynamodb.tables.BFSTTesting.tableName'),
                    Item: {
                        Node: nodeId,
                        Edge: "0",
                        MetaType: "jsoneditor",
                        UpdateTime: Date.now(),
                        Status: "active",
                        CycleCount: 1,
                        T1: Date.now(),
                        T2: Date.now() + 1,
                        BFSTTemplateStarting: {},
                        BFSTTemplateDraft: JSON.parse(req.body.jsonData),
                        BFSTTemplateFinal: {},
                        InitialContext: "First State",
                        FinalContext: "Final State",
                        CurrentContext: "Current State"
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
        }

    });


    app.post('/jsoneditorservices/saveAsFinal', function (req, res) {
        guid.getGUID(config, function (error, nodeId) {
            console.log(nodeId);
            var params = {
                TableName: config.get('dynamodb.tables.BFSTTesting.tableName'),
                Item: {
                    Node: nodeId,
                    Edge: "0",
                    MetaType: "bfst",
                    UpdateTime: Date.now(),
                    Status: "active",
                    CycleCount: 1,
                    T1: Date.now(),
                    T2: Date.now() + 1,
                    BFSTTemplateStarting: {},
                    BFSTTemplateDraft: {},
                    BFSTTemplateFinal: JSON.parse(req.body.jsonData),
                    InitialContext: "First State",
                    FinalContext: "Final State",
                    CurrentContext: "Current State"
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

    app.post('/jsoneditorservices/updatebfstinstance', function (req, res) {
        //req.body.nodeGUID
        //req.body.currentState
        async.waterfall([
            function (callback) {
                updateJSON(this.config, req, callback);
            }
        ], function (err, data) {
            res.send(JSON.stringify(data));
        });
    });

    app.post('/jsoneditorservices/getbfstseed', function (req, res) {
        async.waterfall([
            function (callback) {
                getBFSTSeedType(this.config, callback);
            }
        ], function (err, data) {
            res.send(JSON.stringify(data));
        });
    });

    app.post('/jsoneditorservices/addinstance', function (req, res) {
        async.waterfall([
            function (callback) {
                getBFSTSeedType(this.config, callback);
            },
            function (data, config, callback) {
                addBFSTInstance(data, config, callback);
            }
        ], function (err, data) {
            res.send(JSON.stringify(data));
        });
    });

    app.post('/jsoneditorservices/describeTable', function (req, res) {
        console.log("Before Sending Save Request");
        var params = {
            TableName: config.get('dynamodb.tables.BFSTTesting.tableName'),
        };

        docClient.describeTable(params, function (err, nodeData) {
            if (err) {
                console.log('Insertion Error', err, err.stack, nodeData);
                res.send(JSON.stringify({error: 1, errInfo: err, params: params}));
            }
            else {
                res.send(JSON.stringify({data: nodeData}));
            }
        });
    });

    var getBFSTSeedType = function (config, callback) {
        var params = {
            "TableName": config.get('dynamodb.tables.BFSTTesting.tableName'),
            "Limit": 1,
        };

        docClient.scan(params, function (err, data) {
            if (err) {
                console.log('query-error', err, err.stack, data);
            }
            console.log("Scan Result ==> ");
            console.log(data);
            callback(null, data.Items[0], config);
        });
    }

    var addBFSTInstance = function (data, config, callback) {
        guid.getGUID(config, function (error, nodeId) {
            console.log("GUID Created");
            console.log(nodeId);

            data['Node'] = nodeId;
            data['MetaType'] = 'Instance';
            data['UpdateTime'] = Date.now();
            data['T1'] = Date.now();
            data['T2'] = Date.now() + 1;
            var params = {
                TableName: config.get('dynamodb.tables.BFSTTesting.tableName'),
                Item: data
            };

            docClient.putItem(params, function (err, nodeData) {
                if (err) {
                    console.log('Insertion Error', err, err.stack, nodeData);
                }
                callback(null, data);
            });
        });
    }

    var loadJSON = function (config, req, GUIDTemp, callback) {
        var keyValue = (req.body.nodeGUID != undefined && req.body.nodeGUID != "" ? req.body.nodeGUID : GUIDTemp );
        var params = {
            "TableName": config.get('dynamodb.tables.BFSTTesting.tableName'),
            //ConsistentRead: false, /*Should be false as long as we are querying global secondary Index*/
            KeyConditionExpression: '#key = :value',
            ExpressionAttributeNames: {
                '#key': "Node"
            },
            ExpressionAttributeValues: {
                ':value': keyValue,
            }
        };

        docClient.query(params, function (err, data) {
            if (err) {
                console.log('query-error', err, err.stack, data);
            }
            console.log("Query Result ==> ");
            console.log(data);
            callback(null, data.Items[0]);
        });
    }

    var updateJSON = function (config, req, callback) {
        console.log("before Update");
        console.log(req.body);

        var params = {
            "TableName": config.get('dynamodb.tables.BFSTTesting.tableName'),
            "Key": {},
            "UpdateExpression": "SET #key =:bfstValue",
            "ExpressionAttributeNames": {
                "#key": "BFSTTemplateDraft"
            },
            "ExpressionAttributeValues": {
                ":bfstValue": JSON.parse(req.body.jsonData)
            }
        };

        params.Key[config.get('dynamodb.tables.BFSTTesting.hashKey')] = req.body.nodeGUID;
        params.Key[config.get('dynamodb.tables.BFSTTesting.rangeKey')] = config.get('dynamodb.fixedValues.attributesEdge');

        docClient.updateItem(params, function (err, data) {
            if (err) {
                console.log('query-error', err, err.stack, data);
            }
            console.log("Update Result ==> ");
            console.log(data);
            callback(null, "done");
        });
    }
};