/**
 * Created by Imad on 4/16/2015.
 */
var fs = require('fs');
var doc = require('dynamodb-doc');
var bcrypt = require('bcrypt');
var AWS = require('aws-sdk');

module.exports = function(app, config) {
    AWS.config.update(config.get('config.aws.awsRegion'));
    var awsClient = new AWS.DynamoDB();
    var docClient = new doc.DynamoDB(awsClient);


    app.get('/login.html', function (req, res) {
        var page = fs.readFileSync(__dirname + '/../htm/login.html', 'utf8');
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var referer = req.headers['referer'];
        var date = new Date().toISOString();
        res.cookie('userid', date + '.' + ip);
        res.cookie('referer', referer);
        console.log(req.headers);
        res.send(page);
    });


    app.post('/login', function (req, res) {
        var params = {
            TableName: config.get('config.dynamodb.tables.accounts.tableName'),
            IndexName: config.get('config.dynamodb.tables.accounts.indexes.accountName'),
            KeyConditions: [docClient.Condition("AccountName","EQ",req.body.Username)]
        };

        docClient.query(params,function(err, nodeData){
            if(err) {
                console.log('query-error',err,err.stack,nodeData);
                res.send(JSON.stringify({error: 1, errInfo: nodeData}));
            }
            else {
                if(nodeData.Count == 0) {
                    res.send(JSON.stringify({error:1, errorInfo: "Invalid username"}));
                }
                else {
                    //Compare the passwords
                    if (bcrypt.compareSync(req.body.Password, nodeData.Items[0].AccountPassword)) {
                        res.send(JSON.stringify({login: 1}));
                    }
                    else {
                        res.send(JSON.stringify({error:1, errorInfo: "Invalid password"}));
                    }

                }
            }
        });
    });
};