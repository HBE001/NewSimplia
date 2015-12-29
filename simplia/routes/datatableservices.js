/**
 * Created by Imad on 6/1/2015.
 */
var mysql = require('mysql');
var async = require('async');

module.exports = function(app, config) {
    app.post('/datatableservices/getcols',function(req, res){
        var tableName = req.body.table;

        async.waterfall([
            dbConnect.bind(null),
            function(connection, callback) {
                var sql = "select id,column_name,format_code,english_name,mysql_column_key,mysql_extra from " + config.get('config.db.defaultSchema') +
                          "." + config.get('config.db.translationsTable.tableName') + " where table_schema = " +
                          mysql.escape(config.get('config.db.defaultSchema')) + " and table_name = " + mysql.escape(tableName);
                connection.query(sql, function(err, result){
                    connection.end();
                    callback(err, result);
                });
            },
            function(result, callback) {

                var columnsData = {
                    columns: [],
                    primaryKeys: []
                };

                for(var i = 0; i < result.length; i++) {
                    var column = {
                        key: result[i].column_name,
                        label: result[i][config.get('config.db.translationsTable.languageCols.english')]
                    };
                    if(result[i].format_code){
                        column.formatter = result[i].format_code;
                    }
                    columnsData.columns.push(column);

                    if(result[i].mysql_column_key == 'PRI') {
                        columnsData.primaryKeys.push(result[i].column_name);
                    }

                    if(result[i].mysql_extra == "auto_increment") {
                        columnsData.auto_increment = result[i].column_name;
                    }
                }
                callback(null, columnsData);
            }
        ],function(err, data){
            if(err) {
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            res.send(JSON.stringify({data: data}));
        });
    });

    app.post('/datatableservices/getdata', function(req, res){
        var tableName = req.body.table;
        var queryLimits = JSON.parse(req.body.limits);

        async.waterfall([
            dbConnect.bind(null),
            function(connection, callback) {
                var sql = "select * from " + config.get('config.db.defaultSchema') + "." + tableName + " limit " + queryLimits[0] +
                    "," + queryLimits[1];
                connection.query(sql, function(err, result){
                    connection.end();
                    callback(err, result);
                });
            }
        ], function(err, data){
            if(err) {
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            res.send(JSON.stringify({data: data}));
        });
    });

    var dbConnect = function(callback) {
        var connection = mysql.createConnection({
            host: config.get('config.mysql.host'),
            port: config.get('config.mysql.port'),
            user: config.get('config.mysql.user'),
            database: config.get('config.mysql.db')
        });
        connection.connect(function(err){
            callback(err, connection);
        });
    };

    app.post('/datatableservices/updaterow', function(req, res){
        var tableName = req.body.table;
        var rowData = JSON.parse(req.body.row);
        var idCols = JSON.parse(req.body.ids);

        async.waterfall([
            dbConnect.bind(null),
            function(connection, callback) {
                var sql = createUpdateStatement(tableName, rowData, idCols);
                console.log('update-statement:',sql);
                connection.query(sql, function(err){
                   connection.end();
                    callback(err);
                });
            }
        ], function(err){
            if(err) {
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            return res.send(JSON.stringify({error: 0}));
        });
    });

    app.post('/datatableservices/deleterows', function(req, res){
        var tableName = req.body.table;
        var rowsData = JSON.parse(req.body.rows);

        async.waterfall([
            dbConnect.bind(null),
            function(connection, callback) {
                async.each(rowsData, function(row, eachCallback){
                    var sql = createDeleteStatement(tableName, row);
                    console.log(sql);
                    connection.query(sql, eachCallback);
                }, function(err){
                    connection.end();
                    callback(err);
                });
            }
        ], function(err){
            if(err) {
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            return res.send(JSON.stringify({error: 0}));
        });
    });

    app.post('/datatableservices/addrow', function(req, res){
        var tableName = req.body.table;
        var rowData = JSON.parse(req.body.row);

        async.waterfall([
            dbConnect.bind(null),
            function(connection, callback) {
                var sql = createInsertStatement(tableName, rowData);
                console.log('insert-statement:',sql);
                connection.query(sql, function(err){
                    connection.end();
                    callback(err);
                });
            }
        ], function(err){
            if(err) {
                return res.send(JSON.stringify({error: 1, errorInfo: err}));
            }
            return res.send(JSON.stringify({error: 0}));
        });
    });


    var createUpdateStatement = function(tableName, rowData, idCols) {
        var sql = "update " + config.get('config.db.defaultSchema') + "." + tableName + " set ";
        for(var colName in rowData) {
            sql += colName + " = " + mysql.escape(rowData[colName]) + ",";
        }
        sql = sql.slice(0, -1) + " where ";

        for(var idColName in idCols) {
            sql += idColName + " = " + mysql.escape(idCols[idColName]) + " and ";
        }
        return sql.slice(0, -5);
    };

    var createDeleteStatement = function(tableName, rowData) {
        var sql = "delete from " + config.get('config.db.defaultSchema') + "." + tableName + " where";
        for(var i in rowData) {
            sql += " " + i + " = " + mysql.escape(rowData[i]) + " and";
        }
        return sql.slice(0, -4);
    };

    var createInsertStatement = function(tableName, rowData) {
        var sql = "insert into " + config.get('config.db.defaultSchema') + "." + tableName + " (";

        var valueString = " values ("
        for(var colName in rowData) {
            sql += colName + ",";
            valueString += mysql.escape(rowData[colName]) + ",";
        }
        return sql.slice(0, -1) + ')' + valueString.slice(0,-1) + ')';
    };
};

