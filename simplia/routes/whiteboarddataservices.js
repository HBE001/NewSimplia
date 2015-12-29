/**
 * Created by Yahya on 15/7/2015.
 */
var async = require('async');
var aws = require('aws-sdk');
var doc = require("dynamodb-doc");
//var guid = require('/opt/IDServices/node_modules/guid/index.js');

module.exports = function (app, config) {
    aws.config.update(config.get('aws.awsRegion'));
    var awsClient = new aws.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);

    var awsAccessKeyID = "AKIAJBC2RZ623MXRZ2PA";
    var awsAccessKeySecret = "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";
    var awsS3Bucket = 'oxygencommunications';
    var awsS3BucketSubFolder = 'WhiteboardStream';

    this.config = config;

    app.post('/whiteboarddataservices/signImage', function (req, res) {
        console.log("Sign Policy request");

        aws.config.update({accessKeyId: awsAccessKeyID, secretAccessKey: awsAccessKeySecret});
        var s3 = new aws.S3();
        var options = {
            Bucket: awsS3Bucket,
            Key: awsS3BucketSubFolder + "/" + req.query.episode_name + "/" + req.query.image_name,
            Expires: 60,
            ContentType: req.query.image_type,
            ACL: 'public-read'
        }

        s3.getSignedUrl('putObject', options, function (err, data) {
            if (err) {
                console.log("Error with S3:");
                console.log(err);
                return res.send('Error with S3: ');
            }

            res.json({
                signed_request: data,
                url: 'https://' + awsS3Bucket + '.s3.amazonaws.com/' + awsS3BucketSubFolder + "/"
                + req.query.episode_name + "/" + req.query.image_name,
                key: awsS3BucketSubFolder + "/" + req.query.episode_name + "/" + req.query.image_name
            })
        })
    });

    app.post('/whiteboarddataservices/addsnap', function (req, res) {
        console.log("Before Sending Save Request");
        console.log(req.body.row);
        var rowData = JSON.parse(req.body.row);
        var params = {
            TableName: config.get('dynamodb.tables.whiteboardsnaps.tableName'),
            Item: {
                ImageKey: rowData.Image_KEY,
                ImageURL: rowData.IMAGE_URL,
                StoreTime: rowData.Store_Time
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

    app.post('/whiteboarddataservices/getsnap', function (req, res) {
        var params = {
            TableName: config.get('dynamodb.tables.whiteboardsnaps.tableName'),
            Key: {ImageKey: req.body.Image_KEY}
        };

        docClient.getItem(params, function (err, nodeData) {
            if (err) {
                console.log('query-error', err, err.stack, nodeData);
                res.send(JSON.stringify({error: 1, errInfo: err, params: params}));
            }
            else {
                if (nodeData.Count == 0) {
                    res.send(JSON.stringify({error: 1, errorInfo: "Image URL not found"}));
                }
                else {
                    res.send(JSON.stringify({data: nodeData}));
                }
            }
        });
    });


    app.post('/whiteboarddataservices/addsegment', function (req, res) {
        console.log("Before Sending Save Request");
        console.log(req.body);

        var params = {
            TableName: config.get('dynamodb.tables.whiteboardepisodes.tableName'),
            Key: {EpisodeKey: req.body.Eposide_Name}
        };

        docClient.getItem(params, function (err, nodeData) {
            var rowData = req.body.Segment;
            var segments = [];
            if (err) {
                console.log('query-error', err, err.stack, nodeData);
                res.send(JSON.stringify({
                    error: 1,
                    errInfo: err,
                    errStack: err.stack,
                    params: params,
                    nodeData: nodeData,
                    request_row: JSON.parse(req.body.row)
                }));
            } else {
                if (nodeData !== undefined) {
                    if (nodeData.Item !== undefined && nodeData.Item.recordingSegments.length > 0) {
                        segments = JSON.parse(nodeData.Item.recordingSegments);
                    }
                }
            }

            segments.push(rowData);
            params = {
                TableName: config.get('dynamodb.tables.whiteboardepisodes.tableName'),
                Item: {
                    EpisodeKey: req.body.Eposide_Name,
                    recordingSegments: JSON.stringify(segments),
                }
            }

            docClient.putItem(params, function (err2, nodeData2) {
                if (err2) {
                    console.log('Insertion Error', err2, err2.stack, nodeData2);
                    res.send(JSON.stringify({
                        error: 1,
                        errInfo2: err2,
                        errorStack: err2.stack,
                        params2: params,
                        getResult2: nodeData2
                    }));
                }
                else {
                    res.send(JSON.stringify({data: nodeData2}));
                }
            });
        });
    });

    app.post('/whiteboarddataservices/getsegment', function (req, res) {
        var params = {
            TableName: config.get('dynamodb.tables.whiteboardepisodes.tableName'),
            Key: {EpisodeKey: req.body.Episode_Name}
        };

        docClient.getItem(params, function (err, nodeData) {
            if (err) {
                console.log('query-error', err, err.stack, nodeData);
                res.send(JSON.stringify({error: 1, errInfo: err, params: params}));
            }
            else {
                if (nodeData.Count == 0) {
                    res.send(JSON.stringify({error: 1, errorInfo: "Image URL not found"}));
                }
                else {
                    res.send(JSON.stringify({data: nodeData}));
                }
            }
        });
    });


    app.post('/whiteboarddataservices/createtable', function (req, res) {
        var params = {
            TableName: config.get('dynamodb.tables.whiteboardepisodes.tableName'),
            AttributeDefinitions: [{AttributeName: 'EpisodeKey', AttributeType: 'S'}
            ],
            KeySchema: [{AttributeName: 'EpisodeKey', KeyType: 'HASH'}],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            },
        };
        docClient.createTable(params, function (err, nodeData) {
            if (err) {
                console.log('query-error', err, err.stack, nodeData);
                res.send(JSON.stringify({error: 1, errInfo: err, params: params}));
            }
            else {
                res.send(JSON.stringify({data: nodeData}));
            }
        });
    });


    app.post('/whiteboarddataservices/droptable', function (req, res) {
        var params = {
            TableName: config.get('dynamodb.tables.whiteboardepisodes.tableName') /* required */
        };
        docClient.deleteTable(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
        });

    });


    //--------------------------------------------------------------------
    //app.post('/whiteboarddataservices/getguid', function (req, res) {
    //    console.log("Get Panel GUID");
    //    guid.getGUID(config, function (error, guid) {
    //        console.log("GUID Created");
    //        console.log(error);
    //        console.log(guid);
    //        if (error) {
    //            console.log('Insertion Error', error, error.stack, guid);
    //            res.send(JSON.stringify({error: 1, errInfo: error}));
    //        }
    //        else {
    //            res.send(JSON.stringify({GUID: guid}));
    //        }
    //    });
    //});
};
