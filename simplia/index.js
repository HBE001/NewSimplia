/**
 * Created by Imad on 2/6/2015.
 */
var config = require('config');
var debug = require('debug')('simplia-main');
var express = require('express');
var app = express();
var request = require("request");
var AWS = require('aws-sdk'), dynamodb, docClient, s3;
var doc = require('dynamodb-doc');
var guid = require('./lib/guid');
var async = require('async');
var redis = require('redis');
var Pluploader = require('node-pluploader'), pLoader;

AWS.config.update({region: config.get('config.aws.awsRegion')});
dynamodb = new AWS.DynamoDB();
docClient = new doc.DynamoDB(dynamodb);
s3 = new AWS.S3();

pLoader = new Pluploader({uploadLimit: config.get('config.plupload.uploadLimit')});

var redisClient = redis.createClient(config.get('config.redis.redisServerPort'), config.get('config.redis.redisServer'));
var apps = {express: app, redis: redisClient, docClient: docClient, plupload: pLoader, s3: s3};
var params = {apps: apps, config: config, typeServers: {}, allTips: {} };
var OxygenLib = require('./lib/oxygenlib.js')(params, config);

OxygenLib.awakenServerTip(config.get('config.nodeIds.tips.homethread'), function(){
}, true);