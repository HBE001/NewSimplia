var soap = require('soap');

var globals = {
    //zimbraSOAPUrl: 'http://mail.simplia.com/cgi-bin/soapserver.cgi',
    zimbraSOAPUrl: 'http://tungstenweb.lotusinterworks.com/wsdl.xml',
    zimbraPassword: 'cobalt123',
    zimbraEmailSuffix: '@simplia.com',
    zimbraNamespace: 'zim',
    zimbraXmlns: 'ZimbraServices'
};

exports.createMailbox = function(username, password, firstName, lastName, callback) {
    soap.createClient(globals.zimbraSOAPUrl, function(err, client) {
        var args = {
            userEmail: username + globals.zimbraEmailSuffix,
            userPassword: (( (typeof password !== "undefined") && password) ? password : globals.zimbraPassword),
            firstName: (((typeof firstName !== "undefined") && firstName)? firstName : ""),
            lastName: (((typeof lastName !== "undefined") && lastName)? lastName : username)
        };
        client.createUser(args, function(err, result){
            callback(err, {returnVal: result, email: username + globals.zimbraEmailSuffix});
        });
    });
};

exports.sendPlainTextEmail = function(username, toEmail, subject, body, callback) {
    soap.createClient(globals.zimbraSOAPUrl, function(err, client) {
        var args = {
            userEmail: username + globals.zimbraEmailSuffix,
            toEmail: toEmail,
            subject: subject,
            body: body
        };
        client.sendPlainTextEmail(args, function(err, result){
            callback(err, result);
        });
    });
};