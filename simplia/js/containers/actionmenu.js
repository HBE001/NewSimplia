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

function ActionMenu(Y, properties) {
    //Calling base constructor
    BasicMenu.call(this, Y);

    this.containerClass = 'actionmenu-container';
    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
ActionMenu.prototype = Object.create(BasicMenu.prototype);


ActionMenu.prototype.init = function(callback) {
    var that = this;
    BasicMenu.prototype.init.call(this, function(){
        that.menu.set('bodyContent','<div class="' + that.containerClass + '"><ul></ul></div>');
        that.ulElem = $('#' + that.menu.get('id')).find('.' + that.containerClass + ' ul');
        if(typeof callback !== "undefined") {
            callback();
        }
    });
};

ActionMenu.prototype.addMenuItem = function(menuLabel, callback, addToEnd) {
    var liElemStr = "<li data-label='" + menuLabel + "'>" + menuLabel + "</li>";

    var that = this;

    if(typeof addToEnd !== "undefined" && addToEnd) {
        $(liElemStr).appendTo(this.ulElem).each(function () {
            $(this).click(function () {
                that.hideMenu();
                callback(menuLabel);
            });
        });
    }
    else {
        $(liElemStr).prependTo(this.ulElem).each(function () {
            $(this).click(function () {
                that.hideMenu();
                callback(menuLabel);
            });
        });
    }
};

ActionMenu.prototype.hideMenuItem = function(menuLabel) {
    var liElem = this.ulElem.find("li[data-label='" + menuLabel + "']");
    if(liElem.length) {
        liElem.hide();
    }
};

ActionMenu.prototype.unhideMenuItem = function(menuLabel) {
    var liElem = this.ulElem.find("li[data-label='" + menuLabel + "']");
    if(liElem.length) {
        liElem.show();
    }
};