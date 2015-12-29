/**
 * Created by Imad on 4/16/2015.
 */
var fs = require('fs');
var express = require('express');
var doc = require('dynamodb-doc');

module.exports = function(app, config) {
    app.use('/docs/', express.static(__dirname + '/../out'));
    app.use('/js', express.static(__dirname + '/../js'));
    app.use('/css', express.static(__dirname + '/../css'));
    app.use('/img', express.static(__dirname + '/../img'));
    app.use('/panels', express.static(__dirname + '/../panels'));

    app.use(express.static(__dirname + '/../htm'));
};