/**
 * Created by Imad on 4/30/2015.
 */
var fs = require('fs');
var uuid = require('node-uuid');
var request = require('request');
var mustache = require('mustache');
var async = require('async');

function Baselib(config) {
    this.config = config;
}

//Basic Utilities
Baselib.prototype.getCurrentTime = function () {
    var date = new Date();
    return date.toISOString();
};

Baselib.prototype.getNodeId = function () {
    return this.config.get('nodeId.sectorId') + this.config.get('nodeId.separator') + this.config.get('nodeId.serviceId') + this.config.get('nodeId.separator') + this.getCurrentTime() + this.config.get('nodeId.separator') + this.config.get('nodeId.count');
};

Baselib.prototype.createGUID = function () {
    return uuid.v4();
};

Baselib.prototype.isEmptyObject = function (obj) {
    return !Object.keys(obj).length;
};


//Anonymous User related activities
Baselib.prototype.setupAnonymousUser = function (req, res, docClient, cb) {
    var that = this;
    this.addAnonymousUser(docClient, that.createAnonymousUserItem(req), function (err, userData) {
        if (err) {
            console.log(err, err.stack, userData);
        }
        cb(err, userData);
    });
};


Baselib.prototype.createAnonymousUserId = function (nodeId) {
    return nodeId.replace(/[^\w]/g, "_");
};

Baselib.prototype.addAnonymousUser = function (docClient, item, cb) {
    var putItemParams = {
        Item: item,
        TableName: this.config.get('dynamodb.tables.anonymoususers.tableName')

    };

    console.log('putItemParams', putItemParams);
    docClient.putItem(putItemParams, function (err, data) {
        if (err) {
            console.log('put-item-error', err, err.stack);
        }
        cb(err, item);
    });
};

Baselib.prototype.createAnonymousUserItem = function (req) {
    var item = {
        IP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        VisitCount: 1,
        Visits: [
            {
                Referer: (typeof req.headers['referer'] !== "undefined") ? req.headers['referer'] : null,
                Date: String(new Date().toISOString())
            }
        ]
    };
    var nodeId = item[this.config.get('dynamodb.tables.anonymoususers.hashKey')] = this.getNodeId();
    item[this.config.get('dynamodb.tables.anonymoususers.rangeKey')] = this.config.get('dynamodb.fixedValues.attributesEdge');
    item.TwilioUsername = item.AccountName = this.createAnonymousUserId(nodeId);
    return item;
};

Baselib.prototype.updateAnonymousUser = function (req, res, docClient, userId, update, cb) {
    console.log('userId:',userId);
    console.log('update:', update);
    var that = this;
    async.waterfall([
        this.getAnonymousUser.bind(this, docClient, userId),
        function(data, callback){
            console.log('anonymous-user-data:', data);
            if(data.Count > 0) {
                var updateItemParams = {
                    Key: {},
                    AttributeUpdates: update,
                    TableName: that.config.get('dynamodb.tables.anonymoususers.tableName')
                };
                updateItemParams.Key[that.config.get('dynamodb.tables.anonymoususers.hashKey')] = data.Items[0][that.config.get('dynamodb.tables.anonymoususers.hashKey')];
                updateItemParams.Key[that.config.get('dynamodb.tables.anonymoususers.rangeKey')] = that.config.get('dynamodb.fixedValues.attributesEdge');
                docClient.updateItem(updateItemParams, callback);
            }
            else {
                callback({error: 1, msg: 'No Anonymous user found'});
            }
        }
    ], function(err, updateData){
        if(err) {
           return cb(err, err);
        }
        cb(null, updateData);
    });
};

Baselib.prototype.createAnonymousUserVisitUpdate = function (referer) {
    var update = {
        VisitCount: {
            Action: "ADD",
            Value: 1
        },
        Visits: {
            Action: "ADD",
            Value: [
                {
                    Referer: referer,
                    Date: String(new Date().toISOString())
                }
            ]
        }
    };
    return update;
};

Baselib.prototype.getAnonymousUser = function (docClient, userId, cb) {
    var params = {
        TableName: this.config.get('dynamodb.tables.anonymoususers.tableName'),
        IndexName: this.config.get('dynamodb.tables.anonymoususers.indexes.accountName'),
        KeyConditions: [docClient.Condition("AccountName", "EQ", userId)]
    };

    docClient.query(params, function (err, nodeData) {
        if (err) {
            console.log('query-error', err, err.stack, nodeData);
        }
        cb(err, nodeData);
    });
};

//Dynamodb-related functions
Baselib.prototype.createDynamoDBPutUpdate = function (updateData) {
    var update = {};
    for (var i in updateData) {
        update[i] = {Action: "PUT", Value: updateData[i]};
    }
    return update;
};


//HTTP response related functions
Baselib.prototype.setInitialCookies = function (req, res, cookiesList) {
    var referer = req.headers['referer'];
    for (var i in cookiesList) {
        res.cookie(i, cookiesList[i], {path: this.config.get('cookies.path'), domain: this.config.get('cookies.domain')});
    }
    res.cookie('referer', referer, {path: this.config.get('cookies.path'), domain: this.config.get('cookies.domain')});
};


Baselib.prototype.sendErrorPage = function (res) {
    var page = fs.readFileSync(__dirname + '/../htm/error.html', 'utf8');
    res.send(page);
};

Baselib.prototype.createJSONErrorMessage = function (err, data) {
    return JSON.stringify({error: 1, errorInfo: data});
};

Baselib.prototype.createJSONSuccessMessage = function (data) {
    return JSON.stringify({error: 0, data: data});
};


//External API calls
Baselib.prototype.getDynamicTungstenExt = function (accountId, cb) {
    //request(config.get('tungstenExtensionAPI.allocateDynamicExt'), function(error, response, body){
    console.log('request', JSON.parse(mustache.render(JSON.stringify(config.get('tungstenExtensionAPI.allocateDynamicExt')), {
        account_id: accountId,
        server_identity: config.get('nodeId.sectorId')
    })));
    request(JSON.parse(mustache.render(JSON.stringify(config.get('tungstenExtensionAPI.allocateDynamicExt')), {
        account_id: accountId,
        server_identity: config.get('nodeId.sectorId')
    })), function (error, response, body) {
        console.log('getDynamicTungstenExt-error:', error, 'body:', body);
        if (error) {
            cb(error, body);
        }
        else {
            //Removing the unncessary attribues
            delete body['event_name'];
            cb(0, body);
        }
    });

};

Baselib.prototype.getTungstenExtension = function (accountId, cb) {
    request(JSON.parse(mustache.render(JSON.stringify(config.get('tungstenExtensionAPI.provisionAccountExt')), {account_id: accountId})), function (error, response, body) {
        console.log('got reply');
        if (error) {
            cb(error, body);
        }
        else {
            //Removing the unncessary attribues
            delete body['account_id'];
            delete body['event_name'];
            cb(0, body);
        }
    });
};


module.exports = Baselib;
