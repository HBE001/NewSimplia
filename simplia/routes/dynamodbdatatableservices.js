/**
 * Created by Imad on 6/1/2015.
 */
var mysql = require('mysql');
var async = require('async');
var aws = require('aws-sdk');
var doc = require("dynamodb-doc");
var SqliteConnector = require('./../lib/sqliteconnector.js');

module.exports = function (app, config) {
    var connector = new SqliteConnector(config);

    aws.config.update(config.get('aws.awsRegion'));
    var awsClient = new aws.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);


    app.post('/dynamodbdatatableservices/getcols', function (req, res) {
        var tableName = req.body.table;
        var messageIndex = 1;
        console.log("DynamoDB Message = " + messageIndex++);
        async.waterfall([
            function (callback) {
                describeTable(callback);
            },
            function (callback) {
                getDynamoDBTableSchema(config, req, callback);
            },
            function (loadedData, callback) {
                var result = loadedData.SchemaList;
                var columnsData = {
                    columns: [],
                    primaryKeys: []
                };

                for (var i = 0; i < result.length; i++) {
                    var column = {
                        key: result[i].Name,
                        label: result[i].Name
                    };
                    columnsData.columns.push(column);
                    if (result[i].Name == 'Node') {
                        columnsData.primaryKeys.push(result[i].Name);
                    }
                }
                callback(null, columnsData);
            }
        ], function (err, data) {
            if (err) {
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            res.send(JSON.stringify({data: data}));
        });
    });

    app.post('/dynamodbdatatableservices/getdata', function (req, res) {
        //var tableName = req.body.table;
        //var tableName = config.get("dynamodb.tables.mediaSegments.tableName");
        var tableName = "BFSTTesting";

        async.waterfall([
            function (callback) {
                console.log("Start First Statement");
                initializeTables(req, callback);
            },
            function (callback) {
                console.log("Start Second Statement");
                //var sql = "select * from " + tableName + " WHERE MediaType IN ('" + req.body.mediaSegments.split(',').join("','") + "');";
                var sql = "select * from " + tableName + ";";
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

    var dbConnect = function (callback) {
        var connection = mysql.createConnection({
            host: config.get('mysql.host'),
            port: config.get('mysql.port'),
            user: config.get('mysql.user'),
            database: config.get('mysql.db')
        });
        connection.connect(function (err) {
            callback(err, connection);
        });
    };

    app.post('/dynamodbdatatableservices/addrow', function (req, res) {
        var tableName = req.body.table;
        var rowData = JSON.parse(req.body.row);

        async.waterfall([
            dbConnect.bind(null),
            function (connection, callback) {
                var sql = createInsertStatement(tableName, rowData);
                console.log('insert-statement:', sql);
                connection.query(sql, function (err) {
                    connection.end();
                    callback(err);
                });
            }
        ], function (err) {
            if (err) {
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            return res.send(JSON.stringify({error: 0}));
        });
    });

    app.post('/dynamodbdatatableservices/updaterow', function (req, res) {
        var tableName = req.body.table;
        var rowData = JSON.parse(req.body.row);
        var idCols = JSON.parse(req.body.ids);

        async.waterfall([
            dbConnect.bind(null),
            function (connection, callback) {
                var sql = createUpdateStatement(tableName, rowData, idCols);
                console.log('update-statement:', sql);
                connection.query(sql, function (err) {
                    connection.end();
                    callback(err);
                });
            }
        ], function (err) {
            if (err) {
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            return res.send(JSON.stringify({error: 0}));
        });
    });

    app.post('/dynamodbdatatableservices/deleterows', function (req, res) {
        var tableName = req.body.table;
        var rowsData = JSON.parse(req.body.rows);

        async.waterfall([
            dbConnect.bind(null),
            function (connection, callback) {
                async.each(rowsData, function (row, eachCallback) {
                    var sql = createDeleteStatement(tableName, row);
                    console.log(sql);
                    connection.query(sql, eachCallback);
                }, function (err) {
                    connection.end();
                    callback(err);
                });
            }
        ], function (err) {
            if (err) {
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            return res.send(JSON.stringify({error: 0}));
        });
    });

    var createUpdateStatement = function (tableName, rowData, idCols) {
        var sql = "update " + config.get('db.defaultSchema') + "." + tableName + " set ";
        for (var colName in rowData) {
            sql += colName + " = " + mysql.escape(rowData[colName]) + ",";
        }
        sql = sql.slice(0, -1) + " where ";

        for (var idColName in idCols) {
            sql += idColName + " = " + mysql.escape(idCols[idColName]) + " and ";
        }
        return sql.slice(0, -5);
    };

    var createDeleteStatement = function (tableName, rowData) {
        var sql = "delete from " + config.get('db.defaultSchema') + "." + tableName + " where";
        for (var i in rowData) {
            sql += " " + i + " = " + mysql.escape(rowData[i]) + " and";
        }
        return sql.slice(0, -4);
    };

    var createInsertStatement = function (tableName, rowData) {
        var sql = "insert into " + config.get('db.defaultSchema') + "." + tableName + " (";

        var valueString = " values ("
        for (var colName in rowData) {
            sql += colName + ",";
            valueString += mysql.escape(rowData[colName]) + ",";
        }
        return sql.slice(0, -1) + ')' + valueString.slice(0, -1) + ')';
    };


    // -------------------------------------------------------------
    // Get DynamoDB Table schema from METATable in Dynam0DB
    var getDynamoDBTableSchema = function (config, req, callback) {
        var params = {
            TableName: "MetaTable",
            KeyConditionExpression: '#key = :value',
            ExpressionAttributeNames: {
                '#key': "TableName"
            },
            ExpressionAttributeValues: {
                ':value': "BFSTTesting",
            }
        };

        docClient.query(params, function (err, data) {
            if (err) {
                console.log('query-error', err, err.stack, data);
            }
            console.log("Get Result ==> ");
            console.log(data);
            callback(err, data.Items[0]);
        });
    }

    var describeTable = function (callback) {
        var params = {
            TableName: "MetaTable",
        };

        docClient.describeTable(params, function (err, nodeData) {
            if (err) {
                console.log('Insertion Error', err, err.stack, nodeData);
            }
            else {
                console.log("Table Schema = ");
                console.log(JSON.stringify(nodeData));
                //res.send(JSON.stringify({data: nodeData}));
            }
            callback();
        });
    }


    var initializeTables = function (req, callback) {
        console.log("Initialize Table Start");
        var that = this;
        async.waterfall([
            function (cb) {
                //try {
                connector.createTable(config.get("sqlite.tables.bfstTesting.tableName"), config.get("sqlite.tables.bfstTesting.fields"), cb);
                //} catch (e) {
                //    console.log("Table Exist");
                //}
            },
            function (cb) {
                connector.deleteAllDatafromSqlite(config.get("sqlite.tables.bfstTesting.tableName"), cb);
            },
            function (cb) {
                console.log("Request Intialize Table");
                connector.scanDataFromDynamicDB(
                    config.get("dynamodb.tables.BFSTTesting.tableName"),
                    function (data) {
                        console.log("scaned Data = ");
                        console.log(data);
                        connector.addDynamicDBDataToSqlite(
                            data,
                            config.get("sqlite.tables.bfstTesting.tableName"),
                            config.get("sqlite.tables.bfstTesting.fields"),
                            cb
                        );
                    }
                );
            }
        ], function (error, data) {
            if (error) {
                console.log('initialize-tables-error:', error);
            }
            //tablesInitialized = true;
            callback(error);
        });

    };

};

