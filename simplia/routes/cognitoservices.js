/**
 * Created by Imad on 5/14/2015.
 */
var AWS = require('aws-sdk');

module.exports = function(app, config) {
    var cognitoIdentity = new AWS.CognitoIdentity({apiVersion: config.get('aws.cognitoIdentity.apiVersion')});

    app.get('/cognitoservices/getidentitypools', function(req, res){
        var params = {
            MaxResults: 60,
            NextToken: ','
        };
        cognitoIdentity.listIdentityPools(params, function(err, data){
            if(err){
                console.log('listIdentityPools-error:', err, data, err.stack);
                return res.send(JSON.stringify({error:1, errorInfo:err}));
            }
            var pools = {};
            data.IdentityPools.forEach(function(pool){
                pools[pool.IdentityPoolId] = pool.IdentityPoolName;
            });
            res.send(JSON.stringify(pools));
        });
    });

    app.post('/cognitoservices/getidentitypoolroles', function(req, res){
        var params = {
            IdentityPoolId: req.body.pool
        };
        cognitoIdentity.getIdentityPoolRoles(params, function(err, data){
            if(err){
                console.log('getIdentityPoolRoles-error:', err, data, err.stack);
                return res.send(JSON.stringify({error:1, errorInfo:err}));
            }
            res.send(JSON.stringify(data.Roles));
        });
    });
};
