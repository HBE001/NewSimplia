/**
 * Created by Imad on 5/4/2015.
 */
var twilio = require('twilio');
module.exports = function(app, config) {
    var capability = new twilio.Capability(config.get('config.twilio.accountSid'), config.get('config.twilio.authToken'));
    var lastUser = "";

    app.post('/twilio/gettoken', function(req, res){
        console.log(req.body);
        capability.allowClientIncoming(req.body.username);
        capability.allowClientOutgoing(config.get('config.twilio.simpliaLine.SID'));
        var token = capability.generate();
        console.log('token', token);
        lastUser = req.body.username;
        res.send(JSON.stringify({error: 0, token: token}));
    });

    app.post('/twilio/incomingcall', function(req, res){
        var resp = new twilio.TwimlResponse();
        console.log('lastUser', lastUser);
        resp.say('Please wait while I connect you')
            .dial(function(node){
                node.client(lastUser);
            });
        returnTwimlString(res, resp);
    });

    app.post('/twilio/incomingsms', function(req, res){

    });

    app.post('/twilio/outgoingcall', function(req, res){
        console.log(req.body);
        var resp = new twilio.TwimlResponse();
        if(typeof req.body['PhoneNumber'] !== "undefined") {
            resp.dial({callerId: config.get('config.twilio.simpliaLine.number')}, function (node) {
                node.number(req.body.PhoneNumber);
            });
        }
        else if(typeof req.body['ClientName'] !== "undefined"){
            resp.dial({callerId: config.get('config.twilio.simpliaLine.number')}, function (node) {
                node.number(req.body.ClientName);
            });
        }
        returnTwimlString(res, resp);
    });

    var returnTwimlString = function(res, resp) {
        console.log(resp.toString());
        res.set('Content-type','text/xml');
        res.send(resp.toString());
    };
};
