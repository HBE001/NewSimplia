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
 * Panel that fetches HTML from Mogopak URL that's hosted at S3 location and makes it part of the panel body
 * @param {Object} Y - YUI Global Object
 * @param {Object} properties - Panel attributes
 * @param {String} properites.mogopakUrl - Mogopak URL that needs to be displayed
 * @constructor
 */
function BasicFileViewerPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    //Default titleho
    this.panelTitle = "File Viewer Panel";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
BasicFileViewerPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Main initialization function that also fetches the Mogopak URL data
 * @param {Function} cb - Callback function
 */
BasicFileViewerPanel.prototype.init = function(cb) {
    var that = this;
    BasicPanel.prototype.init.call(this, function(){
        that.getViewerData();
        if(typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 * If mogopakUrl is specified, it gets the HTML for the page and makes it part of the panel body
 */

BasicFileViewerPanel.prototype.getViewerData = function() {
    var that = this;
    $.ajax({
        url: this.fileUrl,
        type: "HEAD",
        cache: false,
        crossDomain: true,
        success: function(data, status, xhr) {
            that.panel.set('bodyContent', '<object data="' + that.fileUrl + '" height="768" width="1024" type="' + xhr.getResponseHeader('Content-Type') + '">');
        }
    })
};

BasicFileViewerPanel.prototype.determineFileType = function(xhr) {
    var contentType = xhr.getResponseHeader('Content-Type');
    var type = {
        'application/pdf': function() { return 'pdf'; }
    };

    if(typeof type[xhr.getResponseHeader('Content-Type')] === "undefined") {
        contentType = 'default';
    }
    return type[contentType]();
};

BasicFileViewerPanel.prototype.openPDFFile = function() {
    this.panel.set('bodyContent', '<embed src="' + this.fileUrl + '" height="800" width="600" type="application/pdf">');
};

BasicFileViewerPanel.prototype.setupRightMenu = function() {
    BasicPanel.prototype.setupRightMenu.call(this);

    this.addShareOption();
};