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
function MogopakViewerPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    //Default title
    this.panelTitle = "Mogopak Viewer Panel";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
MogopakViewerPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Main initialization function that also fetches the Mogopak URL data
 * @param {Function} cb - Callback function
 */
MogopakViewerPanel.prototype.init = function(cb) {
    var that = this;
    BasicPanel.prototype.init.call(this, function(){
        that.getViewerData(cb || undefined);
    });
};

/**
 * If mogopakUrl is specified, it gets the HTML for the page and makes it part of the panel body
 */
MogopakViewerPanel.prototype.getViewerData = function(cb) {
    this.panel.set('bodyContent','<div class="mogopak-container"></div>');
    if(typeof this.mogopakUrl !== "undefined" && this.mogopakUrl) {
        //Given the S3 URL, get the HTML and put it inside the panel
        var that = this;
        $.ajax({
            type: 'GET',
            url: that.mogopakUrl,
            cache: false,
            success: function(data) {
                that.setPanelElement('.mogopak-container', data);
                if(typeof cb !== "undefined") {
                    cb();
                }
            },
            error: function(err) {
                console.log(err);
            }
        });
    }
};
