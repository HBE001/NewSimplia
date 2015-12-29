/**
 * Created by Imad on 4/16/2015.
 */
var fs = require('fs');
var bcrypt = require('bcrypt')
//var zimbraservices = require('zimbraservices');
var doc = require('dynamodb-doc');
var request = require('request');
var BL = require('./../lib/baselib.js'), baselib;
var async = require('async');
var AWS = require('aws-sdk');

module.exports = function(app, config) {
    AWS.config.update(config.get('aws.awsRegion'));
    var awsClient = new AWS.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);
    baselib = new BL(config);

    app.get('/register.html', function (req, res) {
        //Check if the cookie is already present
        if(typeof req.cookies.userid === "undefined") {
            //User's first visit; create a row in DynDB table for him and set cookies
            baselib.setupAnonymousUser(req, res, docClient, function (err, data) {
                if (err) {
                    baselib.sendErrorPage(res, err, data);
                }
                else {
                    baselib.setInitialCookies(req, res,  {userid: data.AccountName, twilioUsername: data.AccountName});
                    sendRegisterPage(res);
                }
            });
        }
        else {
            sendRegisterPage(res);
        }
    });

    app.get('/register_developer.html', function (req, res) {
        //Check if the cookie is already present
        if(typeof req.cookies.userid === "undefined") {
            //User's first visit; create a row in DynDB table for him and set cookies
            baselib.setupAnonymousUser(req, res, docClient, function (err, data) {
                if (err) {
                    baselib.sendErrorPage(res, err, data);
                }
                else {
                    baselib.setInitialCookies(req, res,  {userid: data.AccountName, twilioUsername: data.AccountName});
                    sendRegisterDeveloperPage(res);
                }
            });
        }
        else {
            sendRegisterDeveloperPage(res);
        }
    });


    app.post('/register', function (req, res) {
        async.waterfall([
            addAccount.bind(null, req, {}),
            function(accountData, callback){
                //zimbraservices.createMailbox(req.body.Username, '', '', '', function(err, mailData){
                //    callback(err, {accountData: accountData, mailData: mailData});
                //});
            },
            function(data, callback) {
                updateAccount(data.accountData.Item[config.get('dynamodb.tables.accounts.hashKey')], createAccountPutUpdate({ZimbraEmail: data.mailData.email}), callback);
            }
        ], function(err, data){
            if (err) {
                res.send(baselib.createJSONErrorMessage(err, data));
            }
            else {
                res.send(baselib.createJSONSuccessMessage(data));
            }
        });
    });


    app.post('/registerdeveloper', function (req, res) {
        var identityPool = req.body.identity_pool;
        var poolRole = req.body.pool_role;
        var username = req.body.username;
        var email = req.body.email;
        var password = req.body.password;
        var github_password = req.body.github_password;
        var github_login = req.body.github_login;
        var github_name = req.body.github_name;
        var apacheProvisioning = req.body.apache_provisioning;
        var registrationData = {};
        var dbAccountData = {};

        async.waterfall([
                //Creating an account on Dynamo DB with the data that's currently available; we'll have to do an update
                //since we'll be collecting data over several calls to various systems
                addAccount.bind(
                    null,
                    req,
                    {
                        CognitoProfile: {
                            IdentityPool: identityPool,
                            IdentityPoolRole: poolRole
                        }
                    }
                ),
                //Create the Zimbra account
                function(accountData, callback) {
                    console.log('accountData:', accountData);
                    dbAccountData = accountData;
                    //zimbraservices.createMailbox(username, '', '', '', callback);
                },
                //Call the developer setup API to provision various things on the developer machine
                function(zimbraData, callback) {
                    console.log('zimbra-email:', zimbraData);
                    registrationData.ZimbraEmail = zimbraData.email;
                    request.post({
                        url: config.get('developersetup.url'),
                        form: {
                            email: email,
                            password: password,
                            github_login: github_login,
                            github_password: github_password,
                            github_name: github_name,
                            apache_provisioning: apacheProvisioning,
                            username: username
                        }
                    }, callback);
                },
                //Call the in-house Cognito API to add the credentials with proper role and pool
                function(response, body, callback) {
                    console.log('developersetup-body:', body);
                    var developerSetupResult = JSON.parse(body);
                    if(response.statusCode == 500) {
                        return callback(developerSetupResult);
                    }
                    registrationData.PM2Url = developerSetupResult.developerData.pm2_url;
                    if(apacheProvisioning == "on") {
                        for(var i in developerSetupResult.developerData.ports) {
                            registrationData[i] = developerSetupResult.developerData.ports[i];
                        }
                    }
                    request.post({
                        url: config.get('cognitoadd.url'),
                        form: {username:email, password: password, role: poolRole, pool: identityPool}
                    }, callback)
                },
                //Call the first of the port assignment service API calls - this one is for application ports
                function(response, body, callback){
                    console.log('cognitoadd-body:', body);
                    var cognitoAddResult = JSON.parse(body);
                    if(response.statusCode == 500) {
                        return callback(cognitoAddResult);
                    }
                    request.get({
                        url: config.get('portassignservice.url') + config.get('portassignservice.developmentServerName') +
                            "/" + config.get('portassignservice.portTypes.application') + "/" +
                            config.get('portassignservice.defaultNumPorts') + "/" + email
                    }, callback);
                },
                //Provisioning the debugging ports
                function(response, body, callback){
                    console.log('portassign-app-body:', body);
                    var portData = JSON.parse(body);
                    if(response.statusCode == 500) {
                        return callback(portData);
                    }
                    registrationData.ApplicationPorts = portData.data;
                    request.get({
                        url: config.get('portassignservice.url') + config.get('portassignservice.developmentServerName') +
                            "/" +config.get('portassignservice.portTypes.debug') + "/" + config.get('portassignservice.defaultNumPorts')
                            + "/" + email
                    }, callback);
                },
                //Finally, update the DynamoDB account with all the newly acquired data
                function(response, body, callback){
                    console.log('portassign-debug-body:', body);
                    var portData = JSON.parse(body);
                    if(response.statusCode == 500) {
                        return callback(portData);
                    }
                    registrationData.DebuggingPorts = portData.data;
                    updateAccount(
                        dbAccountData.Item[config.get('dynamodb.tables.accounts.hashKey')],
                        createAccountPutUpdate({DeveloperProfile: registrationData}),
                        callback
                    );
                }
            ],function(err) {
                if (err) {
                    return res.send(baselib.createJSONErrorMessage(1, err));
                }
                res.send(baselib.createJSONSuccessMessage(registrationData));
            }
        );
    });

    //Utility Functions

    //Browser response handlers
    var sendRegisterPage = function(res) {
        var page = fs.readFileSync(__dirname + '/../htm/register.html', 'utf8');
        res.send(page);
    };

    var sendRegisterDeveloperPage = function(res) {
        var page = fs.readFileSync(__dirname + '/../htm/register_developer.html', 'utf8');
        res.send(page);
    };


    //DynamoDB Handlers

    var createAccountItem = function(req, customItems) {
        var item = {
            AccountName: req.body.username || req.body.Username,
            TwilioUsername: req.body.username || req.body.Username,
            AccountPassword: bcrypt.hashSync(req.body.password || req.body.Password, config.get('passwordEncryption.saltLength')),
            UserAttributes: {
                Email: req.body.email || req.body.Email
            }
        };
        item[config.get('dynamodb.tables.accounts.hashKey')] = baselib.getNodeId();
        item[config.get('dynamodb.tables.accounts.rangeKey')] = config.get('dynamodb.fixedValues.attributesEdge');

        //Add the additional fields if specified
        if((typeof customItems !== "undefined") && customItems) {
            for(var i in customItems) {
                item[i] = customItems[i];
            }
        }
        return item;
    };

    var addAccount = function(req, customAttributes, cb) {
        var putItemParams = {
            Item: createAccountItem(req),
            TableName: config.get('dynamodb.tables.accounts.tableName')
        };

        for(var i in customAttributes) {
            putItemParams.Item[i] = customAttributes[i];
        }
        console.log('item:', putItemParams);
        docClient.putItem(putItemParams,function(err, data) {
            if (err) {
                console.log('put-item-error', err, err.stack);
            }
            cb(err, putItemParams);
        });
    };

    var createAccountPutUpdate = function(updateData) {
        var update = {};
        for(var i in updateData){
            update[i] = {Action: "PUT", Value: updateData[i]};
        }
        return update;
    };

    var updateAccount = function(nodeId, update, cb) {
        var updateItemParams = {
            Key: {},
            AttributeUpdates: update,
            TableName: config.get('dynamodb.tables.accounts.tableName')
        };
        updateItemParams.Key[config.get('dynamodb.tables.accounts.hashKey')] = nodeId;
        updateItemParams.Key[config.get('dynamodb.tables.accounts.rangeKey')] = config.get('dynamodb.fixedValues.attributesEdge');


        console.log(updateItemParams);

        docClient.updateItem(updateItemParams, function(err, data){
            if(err) {
                console.log('update-item-error', err, err.stack);
            }
            cb(err, data);
        });
    };

};

