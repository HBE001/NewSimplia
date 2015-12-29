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

function CustomeSubMenu(Y, properties) {
    //Calling baste constructor
    BasicMenu.call(this, Y);

    this.isActive = false;

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
    this.init();
}

//Inheriting from the base object
CustomeSubMenu.prototype = Object.create(BasicMenu.prototype);

CustomeSubMenu.prototype.init = function () {
    var that = this;
    this.menu.set('headerContent', '<div class="header-title"><span class="' + that.subMenuTitle.toLowerCase().replace(" ", "_") + '"><span class="panel-title">' + that.subMenuTitle + '</span>' +
        '<span class="arrow"><span><span class="submenu_arrowdown" style="cursor: pointer;">&#9650;&nbsp;&nbsp;<span/><span/><span/></span></span></span></div>');
    this.menu.set('bodyContent', that.HTMLBody);
    if (this.parentMenu != undefined) {
        this.menu.set("zIndex", this.parentMenu.menu.get("zIndex") + 1);
    }

    this.Y.all(".header-title ." + that.subMenuTitle.toLowerCase().replace(" ", "_") + " .submenu_arrowdown").on("click", function () {
        if (that.isActive) {
            that.deactivate();
            if (this.parentMenu != undefined) {
                if (that.isParentSubMenu) {
                    that.parentMenu.activate();
                } else {
                    that.parentMenu.menu.show();
                }
            }
        }
    }, this);
};

CustomeSubMenu.prototype.activate = function () {
    this.showMenu();
    console.log("Showing SubMenu");
    this.isActive = true;
    this.callbackFunction();
}

CustomeSubMenu.prototype.deactivate = function () {
    this.hideMenu();
    this.isActive = false;
}