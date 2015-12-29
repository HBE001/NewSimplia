/**
 * Created by Imad on 4/16/2015.
 */

//var zimbraservices = require('zimbraservices');
var mustache = require('mustache');
var bcrypt = require('bcrypt');
var fs = require('fs');
var doc = require('dynamodb-doc');
var BL = require('./../lib/baselib.js'), baselib;
var AWS = require('aws-sdk');

module.exports = function(app, config) {
    baselib = new BL(config);
    AWS.config.update(config.get('aws.awsRegion'));
    var awsClient = new AWS.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);

    app.post('/resetpwdrequest', function(req, res){



        var params = {
            TableName: config.get('dynamodb.tables.accounts.tableName'),
            IndexName: config.get('dynamodb.tables.accounts.indexes.accountName'),
            KeyConditions: [docClient.Condition("AccountName","EQ",req.body.Username)]
        };

        docClient.query(params,function(err, nodeData){
            if(err) {
                res.send(JSON.stringify({error: 1, errInfo: nodeData}));
            }
            else {
                if(nodeData.Count == 0) {
                    res.send(JSON.stringify({error:1, errorInfo: "Invalid username"}));
                }
                else {
                    generateResetEmailBody(nodeData.Items[0][config.get('dynamodb.tables.accounts.hashKey')], function(error, body){
                        if(error) {
                            res.send(JSON.stringify({error:1, errorMsg: body}));
                        }
                        else {
                            //zimbraservices.sendPlainTextEmail(config.get('resetEmail.adminEmailAccount'), nodeData.Items[0].UserAttributes.Email, config.get('resetEmail.subject'), body, function (err, result) {
                            //    if(err) {
                            //        res.send(JSON.stringify({error:1, errorInfo: result}));
                            //    }
                            //    else {
                            //        res.send(JSON.stringify({error: 0, msg: "Email sent!"}));
                            //    }
                            //});
                            console.log("Zimbra services send plain text");
                        }
                    });
                }
            }
        });
    });

    app.get('/resetpwd/:guid', function(req, res){
        var params = {
            TableName: config.get('dynamodb.tables.codes.tableName'),
            Key: {GUID: req.params.guid}
        };
        docClient.getItem(params, function(err, data){
            console.log(data);
            if(err || baselib.isEmptyObject(data)) {
                var page = fs.readFileSync(__dirname + '/../htm/invalid.html', 'utf8');
                res.send(page);
            }
            else {
                var page = fs.readFileSync(__dirname + '/../htm/resetpassword.html', 'utf8');
                var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                var referer = req.headers['referer'];
                var date = new Date().toISOString();
                res.cookie('userid', date + '.' + ip);
                res.cookie('referer', referer);
                console.log(req.headers);
                var templateVals = {
                    GUID: req.params.guid
                };
                res.send(mustache.render(page, templateVals));
            }
        });
    });

    app.post('/resetpassword', function (req, res) {
        var params = {
            TableName: config.get('dynamodb.tables.codes.tableName'),
            Key: {GUID: req.body.guid}
        };
        docClient.getItem(params, function(err, data){
            console.log('getItem',data);
            if (err || !data.Item) {
                console.log('get-item-error',err,err.stack,data);
                res.send(JSON.stringify({error: 1, errorInfo: "Invalid"}));
            }
            else {
                var updateItemParams = {
                    Key: {},
                    AttributeUpdates: {
                        AccountPassword: {
                            Action: "PUT",
                            Value: bcrypt.hashSync(req.body.password, config.get('passwordEncryption.saltLength'))
                        }
                    },
                    TableName: config.get('dynamodb.tables.accounts.tableName')
                };
                updateItemParams.Key[config.get('dynamodb.tables.accounts.hashKey')] = data.Item[config.get('dynamodb.tables.accounts.hashKey')];
                updateItemParams.Key[config.get('dynamodb.tables.accounts.rangeKey')] = config.get('dynamodb.fixedValues.attributesEdge');
                docClient.updateItem(updateItemParams, function(err, updateData){
                    if(err) {
                        res.send(JSON.stringify({error: 1, error: updateData}));
                    }
                    else {
                        var deleteItemParams = {
                            TableName: config.get('dynamodb.tables.codes.tableName'),
                            Key: {GUID: req.body.guid}
                        }
                        docClient.deleteItem(deleteItemParams,function(err, deleteData){
                            if(err) {
                                console.log('delete-item-error',err,err.stack,deleteData);
                                res.send(JSON.stringify({error: 1, errorInfo: deleteData}));
                            }
                            else {
                                res.send(JSON.stringify({error: 0, msg: "Password updated"}));
                            }

                        });
                    }
                });
            }
        });
    });


    var generateResetEmailBody = function(nodeId, cb) {
        var params = {
            Item: {
                GUID: baselib.createGUID()
            },
            TableName: config.get('dynamodb.tables.codes.tableName')
        };
        params.Item[config.get('dynamodb.tables.accounts.hashKey')] = nodeId;

        docClient.putItem(params, function(err, data){
            if(err) {
                cb(err, data);
            }
            else {
                var body = "You have requested to reset your password. Click on the following link to proceed:\n\n";
                body += config.get('resetEmail.urlPrefix') + params.Item.GUID;
                cb(0, body);
            }
        });
    }

};