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
/**
 *
 * @param Y
 * @param properties
 * @constructor
 */
function LoginPanel(Y, properties) {
    //Calling base constructor
    BasicFormDatatablePanel.call(this, Y);

    //Default title
    this.panelTitle = "Login";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
LoginPanel.prototype = Object.create(BasicFormDatatablePanel.prototype);

/**
 *
 * @param cb
 */
LoginPanel.prototype.init = function(cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    var that = this;
    BasicFormDatatablePanel.prototype.init.call(this, function(){
        if(typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 *
 */
LoginPanel.prototype.setupRightMenu = function() {
    //Always call the base class's function
    BasicFormDatatablePanel.prototype.setupRightMenu.call(this);
};

/**
 *
 * @param callback
 */
LoginPanel.prototype.getTableData = function(callback) {
    var that = this;

    var tableData = [];
    tableData.push(this.addTableDataRow({type: 'text', value: "Username"}, {type: "textbox", value:''}));
    tableData.push(this.addTableDataRow({type: 'text', value: "Password"}, {type: "password", value:''}));
    tableData.push(this.addTableDataRow({type: 'text', value: "Login"}, {type: "button", name: "Login", callback: function(){ that._login();}}));
    tableData.push(this.addTableDataRow({type: 'text', value: "Reset Password"}, {type: "button", name: "Reset Password", callback: function(){ that._resetPassword();}}));
    tableData.push(this.addTableDataRow({type: 'text', value: "Status"}, {type: "text", value:''}));
    callback(tableData);

};

LoginPanel.prototype._login = function() {
    var that = this;

    var loginData = {command: "loginAccount", role: this.role, data: this.collectFormData()};
    that._setStatus('Verifying credentials...');
    this.doAjaxJSONCall("./" + this.typeNodeId + "/" + this.serverNodeId, {command: "relayServerTip", data: JSON.stringify(loginData)}, function(data){
        if(data.error) {
            that._setStatus(data.errorInfo);
        }
        else {
            that._setStatus('Login Successful! Loading home panel...');
            that.openPanel(data, function(){
                that.hidePanel();
                that.parentPanel.hidePanel();
            });
        }
    });
};

LoginPanel.prototype._resetPassword = function() {
    var that = this;
    $.ajax({
        type: 'POST',
        dataType: "json",
        url: "./resetpwdrequest",
        data: $.param(this.collectFormData()),
        success: function(data) {
            if((typeof data.error !== "undefined") && data.error) {
                that._setStatus('Error: ' + JSON.stringify(data));
            }
            else {
                that._setStatus(data.msg);
            }
        }
    })

};

LoginPanel.prototype._setStatus = function(status) {
    this.setFormValue('Status', {type: 'text', value: status});
};

