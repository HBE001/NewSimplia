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
var sqlite3 = require('sqlite3').verbose();
var doc = require('dynamodb-doc');
var AWS = require('aws-sdk');
var async = require('async');


function SqliteConnector(config) {
    this.db = new sqlite3.Database(':memory:');

    this.config = config;
    AWS.config.update(config.get('config.aws.awsRegion'));
    this.awsClient = new AWS.DynamoDB();
    this.docClient = new doc.DynamoDB(this.awsClient);
}

SqliteConnector.prototype.getTableMetadata = function(tableName, callback) {
    var params = {
        TableName: this.config.get('config.dynamodb.tables.metadata.tableName'),
        Key: {
            TableName: tableName,
            UpdateTime: this.config.get('config.dynamodb.tables.components.metadataUpdateTime')
        }
    };

    this.docClient.getItem(params, callback);
};

/**
 *
 * @param tableName
 * @param mCallback
 */
SqliteConnector.prototype.createTable = function(tableName, mCallback) {
    var that = this;

    async.waterfall([
        function(callback) {
            var dropStatement = "DROP TABLE IF EXISTS " + tableName;
            that.db.run(dropStatement, callback);
        },
        this.getTableMetadata.bind(this, tableName),
        function(itemData, callback) {
            var createStatement = "CREATE TABLE "+ tableName + " (";
            async.each(itemData.Item.SchemaList, function(attribute, eCallback){
                createStatement += attribute.Name + " TEXT,";
                eCallback();
            }, function(error){
                createStatement = createStatement.slice(0, -1);
                createStatement += ")";
                console.log('create-statement:', createStatement);
                callback(error, createStatement);
            });
        },
        function(createStatement, callback) {
            that.db.run(createStatement, callback);
        }
    ], function(error){
        if(error) {
            console.log('sqlite-error:', error);
        }
        mCallback(error);
    });
};

/**
 *
 * @param tableName
 * @param conditionData
 * @param callback
 */
SqliteConnector.prototype.queryDataFromDynamicDB = function(tableName, conditionData, callback) {
    var params = {
        TableName: tableName,
        KeyConditionExpression: this.createKeyConditionExpression(conditionData),
        ExpressionAttributeValues: {
            ':hashkey': conditionData.hashKey,
            ':lowrangekey': conditionData.lowRangeKey,
            ':highrangekey': conditionData.highRangeKey
        }
    };

    console.log('params:', params);

    this.docClient.query(params, function(err, data){
        if(err) {
            console.log('ddb-query-error:', err);
        }
        console.log('ddb-query-data:', data);
        callback(err, data);
    });
};

SqliteConnector.prototype.scanDataFromDynamicDB = function(tableName, conditionData, callback) {
    var filterData = this.createFilterExpressionData(conditionData);
    var params = {
        TableName: tableName,
        FilterExpression: filterData.expression,
        ExpressionAttributeValues: filterData.attributeValues,
        ExpressionAttributeNames: filterData.attributeNames
    };


    console.log('scan-params:', params);
    this.docClient.scan(params, function(err, data){
        if(err) {
            console.log('ddb-scan-error:', err);
        }
        console.log('ddb-scan-data:', data);
        callback(err, data);
    });
};

SqliteConnector.prototype.getColumnNames = function(tableName, callback) {
    var sql = "pragma table_info(" + tableName + ")";
    //console.log('stmt:', sql);
    this.db.all(sql, function(err, rows){
        if(err) {
            return callback(err);
        }
        var colNames = [];
        for(var i in rows) {
            //console.log('row:',rows[i]);
            colNames.push({key: rows[i].name, label: rows[i].name});
        }
        callback(null, colNames);
    });
};

/**
 *
 * @param data
 * @param tableName
 * @param mCallback
 */
SqliteConnector.prototype.addDynamicDBDataToSqlite = function(data, tableName, mCallback) {
    var that = this;
    async.waterfall([
        function(callback) {
            that.getColumnNames(tableName, callback);
        },
        function(columns, callback) {
            console.log('columns:', columns);
            var statement = "INSERT INTO " + tableName + " VALUES (";
            for(var i in columns) {
                statement += "?,";
            }
            statement = statement.slice(0, -1);
            statement += ")";

            var dbStmt = that.db.prepare(statement);

            async.each(data.Items, function(item, cb){
                var values = [];
                for(var i in columns) {
                    var columnName = columns[i].key;
                    if (typeof item[columnName] !== "undefined") {
                        var value = (typeof item[columnName] === "object") ? (JSON.stringify(item[columnName])) : (item[columnName]);
                        //values += i + " '" + data.Items[index][i] + "',";
                        values.push(value);
                    }
                    else {
                        values.push("");
                    }
                }
                console.log('values:', values);
                dbStmt.run(values, function(error){
                    if(error) {
                        console.log('dbstmt-run-error:', error);
                    }
                    cb(error);
                });
            }, function(error){
                if(error) {
                    console.log('async-each-error:', error);
                }
                dbStmt.finalize(function(){
                    callback(error);
                });
            });

        }
    ], mCallback);
};

/**
 *
 * @param conditionData
 * @returns {*}
 */
SqliteConnector.prototype.createKeyConditionExpression = function(conditionData) {
    var that = this;

    var expression = {
        'range': function() {
            var str = that.config.get('config.dynamodb.general.hashKey') + ' = :hashkey AND ' + that.config.get('config.dynamodb.general.rangeKey')
                + ' BETWEEN :lowrangekey AND :highrangekey';
            console.log('expr:', str);
            return str;
        }
    };
    return expression[conditionData.type]();
};

SqliteConnector.prototype.createFilterExpressionData = function(conditionData) {
    var returnData = {
        attributeNames: {},
        attributeValues: {}
    };
    var expression = {
        'AND': function() {
            var str = "";
            for(var i in conditionData.data) {
                str = '#' + conditionData.data[i].name + ' ' + conditionData.data[i].op + ' :' + conditionData.data[i].name + ' AND';
                returnData.attributeNames['#' + conditionData.data[i].name] = conditionData.data[i].name;
                returnData.attributeValues[':' + conditionData.data[i].name] = conditionData.data[i].value;
            }
            returnData.expression = str.slice(0,-4);
            return returnData;
        }
    };

    return expression[conditionData.type]();
};

/**
 *
 * @param tableName
 * @param rowData
 * @param idCols
 * @param mCallback
 */
SqliteConnector.prototype.updateDynamoDBItem = function(tableName, rowData, idCols, mCallback) {
    console.log('updateDynDBItem-rowData:', rowData);
    var that = this;
    async.waterfall([
        this.getTableMetadata.bind(this, tableName),
        function(columnsData, callback) {
            var updateData = that.createUpdateExpressionData(columnsData.Item.SchemaList, rowData);

            var params = {
                TableName: tableName,
                Key: idCols,
                UpdateExpression: updateData.expression,
                ExpressionAttributeValues: updateData.values,
                ExpressionAttributeNames: updateData.names
            };
            that.docClient.updateItem(params, function(error, data){
                if(error) {
                    console.log('update-item-error:', error);
                }
                callback(error);
            });
        }
    ], mCallback);
};

/**
 *
 * @param rowData
 * @returns {{expression: string, values: {}}}
 */
SqliteConnector.prototype.createUpdateExpressionData = function(columnsArray, rowData) {
    var expression = 'SET ';
    var values = {};
    var names = {};

    var columns = {};
    console.log('rowData:', rowData);
    console.log('columnsArray:', columnsArray);
    for(var i in columnsArray) {
        columns[columnsArray[i].Name] = columnsArray[i];
    }


    console.log('columns:', columns);


    for(var colName in rowData) {
        console.log('colName:', colName);
        if(rowData[colName]) {
            expression += '#' + colName + '1 = :' + colName + ',';
            values[':' + colName] = (columns[colName].DynamodbType == 'Map') ? ( this._tryParseJSON(rowData[colName]) || rowData[colName]) : rowData[colName];
            names['#' + colName + 1] = colName;
        }
    }
    expression = expression.slice(0, -1);
    return {
        expression: expression,
        values: values,
        names: names
    };
};

SqliteConnector.prototype.emptyTable = function(tableName, callback) {
    var deleteStatement = "DELETE FROM " + tableName;
    this.db.run(deleteStatement, callback);
};

SqliteConnector.prototype._tryParseJSON = function(jsonString){
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns 'null', and typeof null === "object",
        // so we must check for that, too.
        if (o && typeof o === "object" && o !== null) {
            return o;
        }
    }
    catch (e) { }

    return false;
};

module.exports = SqliteConnector;