/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * � 2010-2015 Lotus Interworks Inc. (�LIW�) Proprietary and Trade Secret.
 * Do not copy distribute or otherwise use without explicit written permission from B. Gopinath President.
 * Do not communicate or share the information contained herein with any one else except employees of LIW  on a need to know basis.
 * LIW values its intellectual properties and excepts all those who work with LIW to protect all work, including ideas, designs, processes,
 * software and documents shared or created in any engagement with LIW as proprietary to LIW.
 * This document may make references to open sourced software being considered or used by LIW.
 * Extensions, including modifications to such open source software are deemed proprietary and trade secret to LIW  until
 * and unless LIW formally and with explicit written consent contributes specific modified open source code back to open source.
 * In any event, including cases where modified open sourced components are placed in open source, the selection, interconnection,
 * configuration, processes, designs, implementation of all technology, including opens source software,
 * that is being developed or is part of LIW deployed systems are proprietary and trade secret to LIW and
 * such information shall not be shared with any one else except employees of LIW on a need to know basis.
 *
 */
var util = require('util');
var BasicServerComponent = require('./../lib/basicservercomponent');

function AnonymousThread(params, callback) {
    //Calling base constructor
    BasicServerComponent.call(this, params, callback || undefined);
}

//Inheriting from the base object
util.inherits(AnonymousThread, BasicServerComponent);

AnonymousThread.prototype.init = function(callback) {
    var that = this;
    BasicServerComponent.prototype.init.call(this, function(){
        if(typeof callback !== "undefined") {
            callback();
        }
    });
};


AnonymousThread.prototype.handleRoute = function(req, res, next) {
    var that = this;

    var command = {
        'getoperations': function() {
            that.getOperations(req, res, data);
        },
        'dooperation': function(data) {
            that.doOperation(req, res, data);
        }
    };
    var data = JSON.parse(req.body.data);
    command[data.command](data || {});
};


AnonymousThread.prototype.getOperations = function(req, res, data) {
    /*
    var operations = [];
    for(var i in this.operations) {
        operations.push(i);
    }
    res.send(JSON.stringify(operations));
    */
    res.send(JSON.stringify(this.behaviourEngine.getRoleInputs(data.role, this.state)));
};


AnonymousThread.prototype.doOperation = function(req, res, data) {
    var operation = data.operation;

    this.behaviourEngine.takeAction(this, data.role, this.state, operation, function(){
        res.send();
    });
};


AnonymousThread.prototype.takeAction = function(input, callback) {
    this.operations[input].call(this, callback);
};

module.exports = AnonymousThread;
