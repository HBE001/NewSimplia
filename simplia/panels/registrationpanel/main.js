/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * © 2010-2015 Lotus Interworks Inc. (“LIW”) Proprietary and Trade Secret.
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
function RegistrationPanel(Y, properties) {
    //Calling base constructor
    BasicFormDatatablePanel.call(this, Y);

    //Default title
    this.panelTitle = "Registration";
    this.registrationUrl = "./register";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
RegistrationPanel.prototype = Object.create(BasicFormDatatablePanel.prototype);

/**
 *
 * @param cb
 */
RegistrationPanel.prototype.init = function(cb) {
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
RegistrationPanel.prototype.setupRightMenu = function() {
    //Always call the base class's function
    BasicFormDatatablePanel.prototype.setupRightMenu.call(this);
};

/**
 *
 * @param callback
 */
RegistrationPanel.prototype.getTableData = function(callback) {
    var that = this;

    var tableData = [];
    tableData.push(this.addTableDataRow("Username", {type: "textbox", value:''}));
    tableData.push(this.addTableDataRow("Email", {type: "textbox", value:''}));
    tableData.push(this.addTableDataRow("Password", {type: "password", value:''}));
    tableData.push(this.addTableDataRow("Confirm Password", {type: "password", value:''}));
    tableData.push(this.addTableDataRow("Register", {type: "button", name: "Register", callback: function(){ that._register();}}));
    tableData.push(this.addTableDataRow("Status", {type: "text", value:''}));
    callback(tableData);

};


/**
 *
 * @param cb
 * @private
 */
RegistrationPanel.prototype._getUsername = function(username, cb) {
    var that = this;
    $.ajax({
        type: 'GET',
        dataType: "json",
        url: "http://nodejs.simplia.com/nameservice/" + username,
        success: function (data) {
            if(typeof data.error === "undefined") {
                that.setFormValue("Username",{type: "textbox", value:data.name});
                cb();
            }
            else {
                that._setStatus(data.error);
            }
        }
    });
};

/**
 *
 * @private
 */
RegistrationPanel.prototype._register = function(){
    var data = this.collectFormData();

    var email = data.Email;
    var password = data.Password;
    var username = data.Username;
    var confirmPassword = data['Confirm Password'];

    //Validate the email
    if(!email || !this._isValidEmailAddress(email)) {
        this._setStatus('Invalid Email!');
        return;
    }
    //Confirm the password
    if(password.length < 6) {
        this._setStatus('Password needs to be at least 6 characters long!');
        return;
    }

    if(password != confirmPassword) {
        this._setStatus('Password mismatch!');
        return;
    }

    if(!username || !this._isValidEmailAddress(username + '-0000@test.com')) {
        this._setStatus('Invalid Username!');
        return;
    }

    var that = this;
    this._getUsername(username, function(){

        that.setFormValue("Register", {type: "button", name: "", callback: function(){ }});
        that._setStatus('Registration request sent. Please wait!');

        $.ajax({
            type: 'POST',
            dataType: "json",
            url: that.registrationUrl,
            data: $.param(that.collectFormData()),
            success: function(data) {
                that.setFormValue("Register", {type: "button", name: "Register", callback: function(){ that._register()}});
                if(typeof data.error !== "undefined" && data.error) {
                    that._setStatus('Error: ' + JSON.stringify(data));
                }
                else {
                    that._setStatus('Registration successful!');
                }
            }
        });
    });


};

RegistrationPanel.prototype._setStatus = function(status) {
    this.setFormValue('Status', {type: 'text', value: status});
};

/**
 * Checks if  the email address is a valid one
 * @param emailAddress
 * @returns {boolean}
 * @private
 */
RegistrationPanel.prototype._isValidEmailAddress = function(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22))){0,64}@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
};