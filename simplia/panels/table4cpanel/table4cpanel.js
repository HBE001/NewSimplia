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
 * The general panel class to create datatables. All datatable panels MUST be derived from this class.
 * @param {Object} Y - Global YUI Object
 * @param {Object} properties - Panel attributes
 * @param {string} properties.panelTitle - Title to be displayed on the panel header
 * @constructor
 * @class
 */
function Table4CPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    this.datatable = "";
    this.originalColumns = [];
    this.primaryKeys = [];
    this.columnWidth = {};
    this.columnsIndexes = {};
    this.hiddenColumn = [];
    this.chkSelectNumberOfPixels = 32;
    this.menuColumnNumberOfPixels = 32;
    this.defaultNumberOfPixels = 150;

    this.stringMeassringCanvas = document.createElement('canvas');
    this.stringMeassringCTX = this.stringMeassringCanvas.getContext("2d");
    this.stringMeassringCTX.font = "11px Arial";

    //Default title
    this.panelTitle = "Datatable Panel";

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
Table4CPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Initializes the datatable, along with the panel
 * @param {Function} cb - Callback to be executed once the datatable has been created
 */
Table4CPanel.prototype.init = function (cb) {
    var that = this;

    BasicPanel.prototype.init.call(this, function () {
        that.rowActionMenu = new RightMenu(this.Y, {parentPanel: that, customMenu: true});

        cb = cb || undefined;
        that._createDatatable(cb);
    });
};

/**
 * Main datatable creation function
 * @param {Function} cb - Callback function to be called after the creation of the datatable
 * @private
 */
Table4CPanel.prototype._createDatatable = function (cb) {
    var that = this;
    $.getScript('./js/JSONFormatter.js', function () {
        $.ajax({
            url: "/oxygencomponentsview/loadData",
            type: "get",
            dataType: "json",
            data: $.param({guid: that.getUrlParameter('guid')}),
            success: function (loadedData) {
                console.log("Result = ");
                console.log(JSON.parse(loadedData.data).YUIDatatable.Settings);

                var formattedJSON = new JSONFormatter(that).formatLoadedSchema(JSON.parse(loadedData.data));
                that.datatable = new that.Y.DataTable(formattedJSON.YUIDatatable.Settings);

                if (typeof cb !== "undefined") {
                    cb();
                }
            }
        });
    })
};

// ==============================================================
// ==============================================================

Table4CPanel.prototype.getUrlParameter = function (sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

