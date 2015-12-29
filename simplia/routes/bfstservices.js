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

    app.post('/bfstservices/savebfstinstance', function (req, res) {
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
                    CurrentContext: req.body.currentState
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

    app.post('/bfstservices/getbfstinstance', function (req, res) {
        //req.body.nodeGUID
        //res.send(JSON.stringify({}));
        async.waterfall([
            function (callback) {
                getBFSTInstance(this.config, req, callback);
            }
        ], function (err, data) {
            res.send(JSON.stringify(data));
        });
    });

    app.post('/bfstservices/updatebfstinstance', function (req, res) {
        //req.body.nodeGUID
        //req.body.currentState
        async.waterfall([
            function (callback) {
                updateBFSTInstance(this.config, req, callback);
            }
        ], function (err, data) {
            res.send(JSON.stringify(data));
        });
    });

    app.post('/bfstservices/getbfstseed', function (req, res) {
        async.waterfall([
            function (callback) {
                getBFSTSeedType(this.config, callback);
            }
        ], function (err, data) {
            res.send(JSON.stringify(data));
        });
    });

    app.post('/bfstservices/describeTable', function (req, res) {
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

    app.post('/bfstservices/addinstance', function (req, res) {
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


    app.post('/bfstservices/getroles', function (req, res) {
        // return the specified roles
        async.waterfall([
            function (callback) {
                getBFSTSeedType(this.config, callback);
            }
        ], function (err, data) {
            res.send(JSON.stringify(data['BFSTTemplateFinal']['Reserved_Roles']));
        });
    });

    app.post('/bfstservices/getinputs', function (req, res) {
        // take role and current state and return list of inputs
        //req.body.currentState
        //req.body.role
        async.waterfall([
            function (callback) {
                getBFSTSeedType(this.config, function (data, config, callback) {
                    callback(data, config, req);
                });
            },
            function (data, config, req, callback) {
                var inputs = getInputs(data, config, req);
                callback(null, inputs);
            }
        ], function (err, data) {
            res.send(JSON.stringify(data));
        });


    });

    var getBFSTSeedType = function (config, callback) {
        var params = {
            "TableName": config.get('dynamodb.tables.BFSTTesting.tableName'),
            "Limit": 1,
            //"FilterExpression": "MetaType = :val",
            //"ExpressionAttributeValues": {":val": {"S": "Seed"}},
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

    var getInputs = function (data, config, req) {
        var currentRole = req.body.role;
        var currentStatus = req.body.currentState;
        var reservedTransitions = data['BFSTTemplateFinal']['Reserved_Transitions'];
        return reservedTransitions[currentRole][currentStatus];
    }

    var getBFSTInstance = function (config, req, callback) {
        var params = {
            "TableName": config.get('dynamodb.tables.BFSTTesting.tableName'),
            //ConsistentRead: false, /*Should be false as long as we are quering global secondary Index*/
            //
            KeyConditionExpression: '#key = :value',
            ExpressionAttributeNames: {
                '#key': "Node"
            },
            ExpressionAttributeValues: {
                ':value': req.body.nodeGUID,
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

    var updateBFSTInstance = function (config, req, callback) {
        console.log("before Update");
        console.log(req.body);
        var params = {
            "TableName": config.get('dynamodb.tables.BFSTTesting.tableName'),
            "Key": {},
            //"Key": {
            //    "Node": {
            //        "M": req.body.nodeGUID
            //    }
            //},
            //,
            "UpdateExpression": "SET #bfstKey =:bfstValue, #stateKey =:stateValue",
            "ExpressionAttributeNames": {
                "#bfstKey": "BFSTTemplateFinal",
                "#stateKey": "CurrentContext"
            },
            "ExpressionAttributeValues": {
                ":bfstValue": JSON.parse(req.body.jsonData),
                ":stateValue": req.body.currentState
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