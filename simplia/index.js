/**
 * Created by Imad on 2/6/2015.
 */
var config = require('config');
var debug = require('debug')('simplia-main');
var express = require('express');
var session = require('express-session');
var app = express();
var RedisStore = require('connect-redis')(session);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require("request");
var fs = require('fs');
var WebSocketServer = require('ws').Server;
var AWS = require('aws-sdk'), dynamodb;
var chatSocketService = require('./sockets/chatWebSocketService.js');
var chatService = new chatSocketService();
var whiteboardSocketService = require('./sockets/whiteboardWebSocketService.js');
var whiteboardService = new whiteboardSocketService();


function setAWSCredentials(user, password, callback) {
    if (typeof(process.env.EC2_AWS_ROLE) !== 'undefined') { // EC2-Node Production ENVIRONMENT
        if (callback) {
            callback();
        }
    } else {
        var providerUrl = 'http://nodejs.simplia.com:5000/serviceapi/cognitorequest';
        var requestJson = {
            "user": user,
            "password": password,
            "domain": "login.lotus.developer"
        };
        request({
            url: providerUrl,
            method: "POST",
            json: true,
            body: requestJson
        }, function (error, response, body) {
            console.log('error:', error, 'body:', body);
            if (response.statusCode == 500) {
                console.log('Error:', body);
                process.exit(-1);
            }

            var providerData = body;
            var sts = new AWS.STS();
            var params = {  // Role for lotusdeveloper? Identity Pool
                RoleArn: providerData.RoleArn,
                RoleSessionName: requestJson.user,
                WebIdentityToken: providerData.Token
            };
            sts.assumeRoleWithWebIdentity(params, function (err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else {
                    AWS.config.credentials = new AWS.EnvironmentCredentials('AWS');
                    AWS.config.credentials = sts.credentialsFrom(data);
                    AWS.config.credentials.get(function () {
                        debug("Inside getcredentials");
                        // Instantiate AWS Resources?
                        callback();
                    });
                } // else
            }); // assume role
        });
    }
};


AWS.config.update({region: config.get('aws.awsRegion')});
setAWSCredentials(config.get('aws.cognitoUsername'), config.get('aws.cognitoPassword'), function () {  // Please use username and password provided by Lotus Admin

    dynamodb = new AWS.DynamoDB();

    app.use(cookieParser());
    app.use(session({
        store: new RedisStore({
            host: config.get('redis.redisServer'),
            port: config.get('redis.redisServerPort')
        }),
        secret: '1234567890QWERTY',
        saveUninitialized: true,
        resave: true,
        cookie: {domain: config.get('cookies.domain')}
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    require('./routes')(app, config, dynamodb);
    app.use(express.static(__dirname + '/htm'));

    var server = app.listen(config.get('express.serverPort'), function () {

    });

    //var server2 = app.listen('3005', function () {
    //
    //});


    var wss = new WebSocketServer({server: server});
    wss.on('connection', function (ws) {
        ws.on('message', function (data, flags) {
            console.log("Socket Message = " + data);
            var dataObj = JSON.parse(data);
            switch (dataObj.message) {
                case 'panel-movement-data':
                    handlePanelMovementEvent(dataObj.data);
                    break;

                case 'gettreedata':
                    getTreeData(dataObj.data, ws);
                    break;

                case 'whiteboard-chat-message':
                    chatService.handleChatMessage(dataObj.data);
                    break;

                case 'instantiate-whiteboard-chat-panel':
                    chatService.instantiateSessionGUID(wss, ws, config);
                    break;

                case 'whiteboard-message':
                    whiteboardService.handleChatMessage(dataObj.data);
                    break;

                case 'instantiate-whiteboard-panel':
                    whiteboardService.instantiateSessionGUID(wss, ws, config);
                    break;
            }
        });
    });
});

var handlePanelMovementEvent = function (data) {
    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify({panelname: data.panelname, data: data}))
    });
};

var getTreeData = function (data, ws) {
    var params = {
        TableName: config.get('dynamodb.tables.accounts.tableName'),
        Select: 'ALL_ATTRIBUTES',
        ScanIndexForward: true,
        KeyConditions: {
            Node: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [
                    {
                        S: data.username
                    }
                ]
            }
        }
    };
    dynamodb.query(params, function (err, queryData) {
        if (err) {
            console.log(err, err.stack);
        }
        else {
            console.log(queryData);
            ws.send(JSON.stringify({callback: data.callback, data: queryData}));
        }
    });
};