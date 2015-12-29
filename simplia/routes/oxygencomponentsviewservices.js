/**
 * Created by Yahya on 9/9/2015.
 */
var async = require('async');
var aws = require('aws-sdk');
var doc = require("dynamodb-doc");
var guid = require('/opt/IDServices/node_modules/guid/index.js');
var json2html = require('node-json2html');
//var gdn = require('./../lib/gdn.js');
var gdn = require('/opt/IDServices/node_modules/gdn/index.js');


module.exports = function (app, config) {
    aws.config.update(config.get('aws.awsRegion'));
    var awsClient = new aws.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);

    app.get('/oxygencomponentsview/loadOxygenComponents/:gdn', function (req, res) {
        console.log("From Server: loadOxygenComponents : ", req.params);
        gdn.getGUID(req.param('gdn'), function (data, err) {
            if (data) {
                console.log("GETTing GUID from GDN");
                console.log(data);
                docClient.getItem({
                    TableName: 'OxygenComponents',
                    Key: {Node: data, Edge: 'Self'}
                }, function (error, nodeData) {
                    if (error) {
                        console.log('getItem-error:', error);
                        return res.send(JSON.stringify({error: error}));
                    }
                    res.send(nodeData.Item);
                });
            } else {
                console.log(err);
                res.send(JSON.stringify({error: err}));
            }
        });
    });

    app.get('/oxygencomponentsview/applyOnServer/:gdn', function (req, res) {
        gdn.getGUID(req.param('gdn'), function (data, err) {
            if (data) {
                console.log("GETTing GUID from GDN");
                console.log(data);
                docClient.getItem({
                    TableName: 'OxygenComponents',
                    Key: {Node: data, Edge: 'Self'}
                }, function (error, nodeData) {
                    if (error) {
                        console.log('getItem-error:', error);
                        return res.send(JSON.stringify({error: error}));
                    }
                    console.log('-------------------------');
                    console.log(nodeData.Item.Code);
                    console.log('-------------------------');
                    console.log(nodeData.Item.Code.ApplicationServerCode);
                    console.log('-------------------------');
                    console.log(nodeData.Item.Code.ApplicationServerCode.code);
                    console.log('-------------------------');
                    //try {
                        if (nodeData.Item.Code.ApplicationServerCode != undefined) {
                            eval(nodeData.Item.Code.ApplicationServerCode.code);
                            if (nodeData.Item.Code.ApplicationServerCode.code.indexOf("res.send(") == -1) {
                                res.send("done");
                            }
                        } else {
                            res.send("done");
                        }
                    //} catch (error2) {
                    //    console.log("Error Happened on Server");
                    //    console.log(error2);
                    //    res.send("Error on Server");
                    //}
                });
            } else {
                console.log(err);
                res.send(JSON.stringify({error: err}));
            }
        });
    });

    app.post('/oxygencomponentsview/dataTransformForm', function (req, res) {
        var transform = req.body.transform;
        var neededData = req.body.neededData || {'': ''};
        console.log('req.body.transform', req.body.transform);
        console.log('req.body.neededData', req.body.neededData);
        console.log('trans', transform);
        console.log('data', neededData);
        var html1 = json2html.transform(neededData, transform);
        console.log('a', html1);
        res.send(html1);
    });

    app.get('/oxygencomponentsview/loadData', function (req, res) {
        docClient.getItem({TableName: 'JustJsons', Key: {Node: req.query.guid, Edge: 'Self'}}, function (error, data) {
            if (error) {
                console.log(error);
                res.send({error: error});

            }
            else {
                console.log(data.Item);
                res.send(data.Item);

            }
        });
    });


};