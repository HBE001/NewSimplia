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
function OxygenTab(Y, properties) {
    this.Y = Y;
    this.panels = {};

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

OxygenTab.prototype.init = function(callback) {
    var that = this;
    this.Y.screenManager.getGUID(function(error, guid){
        if(error) {
            console.log('error:', error);
        }
        that.tabId = guid || "";
        if(typeof callback !== "undefined") {
            callback(error);
        }
    });
};

OxygenTab.prototype.addPanel = function(panelId, panel) {
    this.panels[panelId] = panel;
};

OxygenTab.prototype.getPanel = function(panelId) {
    return this.panels[panelId] || null;
};

OxygenTab.prototype.getTabId = function() {
    return this.tabId;
};

OxygenTab.prototype.getTabNum = function() {
    return this.tabNum;
};