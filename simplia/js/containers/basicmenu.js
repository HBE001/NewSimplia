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

function BasicMenu(Y) {
    //Calling base constructor
    BasicContainer.call(this, Y);

    this.container = {};
}

//Inheriting from the base object
BasicMenu.prototype = Object.create(BasicContainer.prototype);


BasicMenu.prototype.createMenu = function() {
    this.container = this.menu = new this.Y.Panel({
        headerContent: '<div class="header-title">Action</div>',
        zIndex       : 1,
        centered     : true,
        modal        : false,
        visible      : false,
        render       : false,
        plugins      : [Y.Plugin.Drag]
    }).render("#" + this.parentPanel.getPanelId());
    //}).render(this.Y.screenManager.getMenusParentDiv());

};

BasicMenu.prototype.showMenu = function() {
    this.bringToTop(this.parentPanel || this.parentMenu);
    this.menu.show();
};

BasicMenu.prototype.hideMenu = function() {
    this.menu.hide();
};

BasicMenu.prototype.init = function(callback) {
    var that = this;
    BasicContainer.prototype.init.call(this, function() {
        that.setInitParams();
        that.createMenu();
        if (typeof callback !== "undefined") {
            callback();
        }
    });
};

BasicMenu.prototype.setInitParams = function() {
    if(typeof this.parentTab === "undefined") {
        this.parentTab = this.parentPanel.parentTab;
    }
};
