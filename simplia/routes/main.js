/**
 * Created by Imad on 4/16/2015.
 */
var fs = require('fs');
var express = require('express');
var AWS = require('aws-sdk');
var doc = require('dynamodb-doc');
var BL = require('./../lib/baselib'), baselib;

module.exports = function(app, config) {
    baselib = new BL(config);
    AWS.config.update(config.get('aws.awsRegion'));
    var awsClient = new AWS.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);

    app.use('/docs/', express.static(__dirname + '/../out'));
    app.use('/js', express.static(__dirname + '/../js'));
    app.use('/css', express.static(__dirname + '/../css'));
    app.use('/img', express.static(__dirname + '/../img'));
    app.use('/panels', express.static(__dirname + '/../panels'));
    app.get('/index.html', function (req, res) {
        var page = fs.readFileSync(__dirname + '/../htm/index.html', 'utf8');
        if(typeof req.cookies.userid === "undefined") {
            //User's first visit; create a row in DynDB table for him and set cookies
            baselib.setupAnonymousUser(req, res, docClient, function (err, data) {
                if (err) {
                    baselib.sendErrorPage(res, err, data);
                }
                else {
                    baselib.setInitialCookies(req, res, {userid: data.AccountName, twilioUsername: data.AccountName});
                    res.send(page);
                }
            });
        }
        else {
            res.send(page);
        }
    });
    app.get('/dev-index.html', function (req, res) {
        var page = fs.readFileSync(__dirname + '/../htm/dev-index.html', 'utf8');
        if(typeof req.cookies.userid === "undefined") {
            //User's first visit; create a row in DynDB table for him and set cookies
            var userId = baselib.createAnonymousUserId(req);
            baselib.addAnonymousUser(docClient, req, res, userId, function (err, data) {
                if (err) {
                    sendErrorPage(res, err, data);
                }
                else {
                    baselib.setInitialCookies(req, res,  {userid: data.AccountName, twilioUsername: data.AccountName});
                    res.send(page);
                }
            });
        }
        else {
            res.send(page);
        }
    });

    app.post('/api/storelocation', function (req, res) {
        console.log('req:',req.body);
        baselib.updateAnonymousUser(req, res, docClient, req.body.userid, baselib.createDynamoDBPutUpdate({Location: JSON.parse(req.body.location)}),function(err, data){
            if(err){
                res.send(baselib.createJSONErrorMessage(err, data));
            }
            else {
                res.send(baselib.createJSONSuccessMessage("Successfully stored location"));
            }
        });
    });


};