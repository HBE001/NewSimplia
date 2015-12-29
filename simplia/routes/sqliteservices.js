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

var SqliteConnector = require('./../lib/sqliteconnector.js');
var async = require('async');

module.exports = function(app, config) {
    var initializedTables = {};
    var connector = new SqliteConnector(config);

    app.post('/sqliteservices/getcols',function(req, res){
        var tableName = req.body.table;
        var dataType = req.body.dataType;
        var initData = (typeof req.body.initData !== "undefined") ? JSON.parse(req.body.initData): {};
        console.log('tableName:', tableName);

        async.waterfall([
            checkTable.bind(null, tableName, dataType, initData, req.body.reinitialize || false, req.body.repopulate || false),
            connector.getColumnNames.bind(connector, tableName),
            function(colNames, callback) {
                var colData = {
                    columns: colNames,
                    primaryKeys: [config.get('config.dynamodb.general.hashKey'), config.get('config.dynamodb.general.rangeKey')]
                };
                callback(null, colData);
            }
        ],function(error, data){
            if(error) {
                console.log('getcols-error:', error);
                return res.send(JSON.stringify({error: 1, errorData: data}));
            }
            console.log('getcols-data:', data);
            res.send(JSON.stringify({data: data}));
        });

    });

    app.post('/sqliteservices/getdata', function(req, res) {
        var tableName = req.body.table;
        var dataType = req.body.dataType;
        var queryLimits = JSON.parse(req.body.limits);
        var initData = (typeof req.body.initData !== "undefined") ? JSON.parse(req.body.initData): {};

        async.waterfall([
            checkTable.bind(null, tableName, dataType, initData,req.body.reinitialize || false, req.body.repopulate || false),
            function(callback) {
                var sql = "select * from " + tableName + " limit " + queryLimits[0] +
                    "," + queryLimits[1];
                connector.db.all(sql, callback);
            }
        ], function(err, data){
            if(err) {
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            res.send(JSON.stringify({data: data}));
        });
    });

    app.post('/sqliteservices/updaterow', function(req, res){
        var tableName = req.body.table;
        var dataType = req.body.dataType;
        var initData = (typeof req.body.initData !== "undefined") ? JSON.parse(req.body.initData): {};
        var rowData = JSON.parse(req.body.row);
        var idCols = JSON.parse(req.body.ids);

        console.log('updaterow-rowData:', rowData);
        async.waterfall([
            checkTable.bind(null, tableName, dataType, initData, req.body.reinitialize || false, req.body.repopulate || false),
            function(callback) {
                var sqlObj = createUpdateStatement(tableName, rowData, idCols);
                console.log('update-statement:',sqlObj.sql);
                connector.db.run(sqlObj.sql, sqlObj.values, callback);
            },
            function(callback) {
                console.log('before-update-rowData:', rowData);
                connector.updateDynamoDBItem(tableName, rowData, idCols, callback);
            }
        ], function(err){
            if(err) {
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            return res.send(JSON.stringify({error: 0}));
        });
    });

    var repopulateTable = function(tableName, dataType, initData, callback) {
        async.waterfall([
            function(cb) {
                connector.emptyTable(tableName, cb);
            },
            function(cb) {
                var type = {
                    'query': function(){
                        connector.queryDataFromDynamicDB(
                            tableName,
                            {
                                type: initData.queryType,
                                hashKey: initData.nodeId,
                                lowRangeKey: '0',
                                highRangeKey: '0'
                            },
                            function(error, data) {
                                if(error) {
                                    return callback(error);
                                }
                                connector.addDynamicDBDataToSqlite(
                                    data,
                                    tableName,
                                    cb
                                );
                            }
                        );
                    },
                    'scan': function(){
                        connector.scanDataFromDynamicDB(
                            tableName,
                            {
                                type: initData.scanType,
                                data: initData.filterData
                            },
                            function(error, data) {
                                if (error) {
                                    return callback(error);
                                }

                                connector.addDynamicDBDataToSqlite(
                                    data,
                                    tableName,
                                    cb
                                );
                            }

                        )
                    }
                };
                type[dataType]();
            }
        ], function(error,data){
            if(error) {
                console.log('initialize-tables-error:', error);
            }
            initializedTables[tableName] = true;
            callback(error);
        });
    };


    var initializeTable = function(tableName, dataType, initData, callback) {
        async.waterfall([
            function(cb) {
                connector.createTable(tableName, cb);
            },
            function(cb) {
                var type = {
                    'query': function(){
                        connector.queryDataFromDynamicDB(
                            tableName,
                            {
                                type: initData.queryType,
                                hashKey: initData.nodeId,
                                lowRangeKey: '0',
                                highRangeKey: '0'
                            },
                            function(error, data) {
                                if(error) {
                                    return callback(error);
                                }
                                connector.addDynamicDBDataToSqlite(
                                    data,
                                    tableName,
                                    cb
                                );
                            }
                        );
                    },
                    'scan': function(){
                        connector.scanDataFromDynamicDB(
                            tableName,
                            {
                                type: initData.scanType,
                                data: initData.filterData
                            },
                            function(error, data) {
                                if (error) {
                                    return callback(error);
                                }

                                connector.addDynamicDBDataToSqlite(
                                    data,
                                    tableName,
                                    cb
                                );
                            }

                        )
                    }
                };
                type[dataType]();
            }
        ], function(error,data){
            if(error) {
                console.log('initialize-tables-error:', error);
            }
            initializedTables[tableName] = true;
            callback(error);
        });
    };

    var createUpdateStatement = function(tableName, rowData, idCols) {
        var values = [];
        var sql = "update " + tableName + " set ";
        for(var colName in rowData) {
            sql += colName + " = ?,";
            values.push(rowData[colName]);
        }
        sql = sql.slice(0, -1) + " where ";

        for(var idColName in idCols) {
            sql += idColName + " = ? and ";
            values.push(idCols[idColName]);
        }
        var returnVal = {
            sql: sql.slice(0, -5),
            values: values
        };
        return returnVal;
    };

    var checkTable = function(tableName, dataType, initData, reinitialize, repopulate, callback) {
        if(typeof initializedTables[tableName] !== "undefined" && !reinitialize) {
            if(repopulate) {
                repopulateTable(tableName, dataType, initData, callback);
            }
            else {
                callback(null);
            }
        }
        else {
            initializeTable(tableName, dataType, initData, callback);
        }
    };


};