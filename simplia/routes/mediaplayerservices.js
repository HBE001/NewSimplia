/**
 * Created by Yahya on 9/9/2015.
 */
var async = require('async');
var SqliteConnector = require('./../lib/sqliteconnector.js');
var guid = require('/opt/IDServices/node_modules/guid/index.js');
var aws = require('aws-sdk');
var doc = require("dynamodb-doc");

module.exports = function (app, config) {
    var tablesInitialized = false;
    var connector = new SqliteConnector(config);

    aws.config.update(config.get('aws.awsRegion'));
    var awsClient = new aws.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);

    app.post('/mediaplayerservices/getcols', function (req, res) {
        var tableName = req.body.table;
        console.log('tableName:', tableName);

        async.waterfall([
            function (callback) {
                if (tablesInitialized) {
                    callback(null);
                }
                else {
                    initializeTables(req, callback);
                }
            },
            function (callback) {
                var sql = "pragma table_info(" + tableName + ")";
                console.log('stmt:', sql);
                connector.db.all(sql, function (err, rows) {
                    if (err) {
                        return callback(err);
                    }
                    var colNames = [];
                    for (var i in rows) {
                        console.log('row:', rows[i]);
                        colNames.push({key: rows[i].name, label: rows[i].name});
                    }
                    callback(null, colNames);
                });
            },
            function (colNames, callback) {
                var colData = {
                    columns: colNames,
                    primaryKeys: [config.get('dynamodb.general.hashKey'), config.get('dynamodb.general.rangeKey')]
                };
                callback(null, colData);
            }
        ], function (error, data) {
            if (error) {
                console.log('getcols-error:', error);
            }
            console.log('getcols-data:', data);
            res.send(JSON.stringify({data: data}));
        });

    });

    app.post('/mediaplayerservices/getdata', function (req, res) {
        var tableName = config.get("dynamodb.tables.mediaSegments.tableName");

        async.waterfall([
            function (callback) {
                console.log("Start First Statement");
                initializeTables(req, callback);

                //if (tablesInitialized) {
                //    console.log("Table Intialized");
                //    callback(null);
                //}
                //else {
                //    console.log("Table Not Intialized");
                //    initializeTables(req, callback);
                //}
                //console.log("Finish First Statement");
            },
            function (callback) {
                console.log("Start Second Statement");
                var sql = "select * from " + tableName + " WHERE MediaType IN ('" + req.body.mediaSegments.split(',').join("','") + "');";
                //var sql = "select * from " + tableName + ";";
                console.log("SQL Statment = " + sql);
                var result = connector.db.all(sql, callback);
                console.log("Finish Second Statement");
                console.log("result = ");
                console.log(result);
            }
        ], function (err, data) {
            console.log("Waterfall Callback Start");
            if (err) {
                console.log("Call Back Error = ");
                console.log(err);
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            console.log("Call Back Data = ");
            console.log(data);
            res.send(JSON.stringify({data: data}));
            console.log("Waterfall Callback End");
        });
    });

    app.post('/mediaplayerservices/updaterow', function (req, res) {
        var tableName = req.body.table;
        var rowData = JSON.parse(req.body.row);
        var idCols = JSON.parse(req.body.ids);

        async.waterfall([
            function (callback) {
                if (tablesInitialized) {
                    callback(null);
                }
                else {
                    initializeTables(req, callback);
                }
            },
            function (callback) {
                var sqlObj = createUpdateStatement(tableName, rowData, idCols);
                console.log('update-statement:', sqlObj.sql);
                connector.db.run(sqlObj.sql, sqlObj.values, callback);
            },
            function (callback) {
                connector.updateDynamoDBItem(tableName, 'mediaSegments', rowData, idCols, callback);
            }
        ], function (err) {
            if (err) {
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            return res.send(JSON.stringify({error: 0}));
        });
    });

    var initializeTables = function (req, callback) {
        console.log("Initialize Table Start");
        var that = this;
        async.waterfall([
            function (cb) {
                try {
                    connector.createTable(config.get("sqlite.tables.mediaSegments.tableName"), config.get("sqlite.tables.mediaSegments.fields"), cb);
                } catch (e) {
                    console.log("Table Exist");
                }
            },
            function (cb) {
                connector.deleteAllDatafromSqlite(config.get("sqlite.tables.mediaSegments.tableName"), cb);
            },
            function (cb) {
                console.log("Request Intialize Table");
                console.log("=====================================");
                console.log(req);
                console.log("=====================================");
                var mediaSegments = req.body.mediaSegments.split(",");
                for (var i = 0; i < mediaSegments.length; i++) {
                    connector.getDataFromDynamicDB(
                        config.get("dynamodb.tables.mediaSegments.tableName"),
                        {
                            type: 'range',
                            mediaType: that.config.get('dynamodb.tables.mediaSegments.mediaType'),
                            startingTime: that.config.get('dynamodb.tables.mediaSegments.startingTime'),
                            mediaValue: mediaSegments[i],
                            lowRangeKey: req.body.startingTime,
                            highRangeKey: req.body.endingTime,
                            attributes: 'ALL_ATTRIBUTES'
                        },
                        function (data) {

                            connector.addDynamicDBDataToSqlite(
                                data,
                                config.get("sqlite.tables.mediaSegments.tableName"),
                                config.get("sqlite.tables.mediaSegments.fields"),
                                cb
                            );
                        }
                    );
                }
            }
        ], function (error, data) {
            if (error) {
                console.log('initialize-tables-error:', error);
            }
            //tablesInitialized = true;
            callback(error);
        });

    };

    var createUpdateStatement = function (tableName, rowData, idCols) {
        var values = [];
        var sql = "update " + tableName + " set ";
        for (var colName in rowData) {
            sql += colName + " = ?,";
            values.push(rowData[colName]);
        }
        sql = sql.slice(0, -1) + " where ";

        for (var idColName in idCols) {
            sql += idColName + " = ? and ";
            values.push(idCols[idColName]);
        }
        var returnVal = {
            sql: sql.slice(0, -5),
            values: values
        };
        return returnVal;
    };

    // ------------------------------------------------------------------------

    app.post('/mediaplayerservices/addItems', function (req, res) {
        console.log("Before Sending Save Request");
        guid.getGUID(config, function (error, nodeId) {
            console.log("GUID Created");
            console.log(error);
            console.log(nodeId);
            var item_guid = nodeId;
            var params = {
                TableName: config.get('dynamodb.tables.mediaSegments.tableName'),
                Item: {
                    Node: item_guid,
                    Edge: "edge",
                    CycleCount: 1,
                    Status: "active",
                    UpdateTime: "1441856500",
                    T1: "1441856500",
                    T2: "1441856740",
                    StartingTime: "1441856500",
                    EndingTime: "1441856740",
                    MediaType: "video",
                    MediaLocation: "https://s3.amazonaws.com/oxygencommunications/videostream/test_video.mp4"
                }
            };

            docClient.putItem(params, function (err, nodeData) {
                if (err) {
                    console.log('Insertion Error', err, err.stack, nodeData);
                    res.send(JSON.stringify({error: 1, errInfo: err, params: params}));
                }
                else {
                    res.send(JSON.stringify({data: nodeData}));
                }
            });
        });
    });

    app.post('/mediaplayerservices/describeTable', function (req, res) {
        console.log("Before Sending Save Request");
        var params = {
            TableName: config.get('dynamodb.tables.mediaSegments.tableName'),
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
};

//Type is Global Secondary Hash and StartingTime is Global Secondary Range