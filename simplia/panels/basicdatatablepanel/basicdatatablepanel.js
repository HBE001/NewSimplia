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
function BasicDatatablePanel(Y, properties) {
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

    //Default title
    this.panelTitle = "Datatable Panel";

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
BasicDatatablePanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Initializes the datatable, along with the panel
 * @param {Function} cb - Callback to be executed once the datatable has been created
 */
BasicDatatablePanel.prototype.init = function (cb) {
    var that = this;
    BasicPanel.prototype.init.call(this, function () {
        cb = cb || undefined;
        that._createDatatable(cb);
    });
};

/**
 * Main datatable creation function
 * @param {Function} cb - Callback function to be called after the creation of the datatable
 * @private
 */
BasicDatatablePanel.prototype._createDatatable = function (cb) {
    var that = this;
    var checkboxAvailable = (this.selectionVisible == undefined ? true : this.selectionVisible);

    this.getColumnData(function (colData) {
        that.getTableData(function (tableData) {
            that.originalColumns = colData.columns;
            that.primaryKeys = colData.primaryKeys;

            that.datatable = new that.Y.DataTable({
                columns: colData.columns,
                data: tableData,
                srcNode: that.getPanelElement('.yui3-widget-bd'),
                editable: true,
                allowHTML: true,
                defaultEditor: 'inline',
                editOpenType: 'click',
                scrollable: true,
                //width: "600px",
                //height: "600px",
                autoWidth: true,
                primaryKeys: that.primaryKeys,
                checkboxSelectMode: checkboxAvailable,
                render: true
            });

            that.setFixedSizesForColumns();
            //that._resizeToFit();

            if (typeof cb !== "undefined") {
                cb();
            }
        });
    });
};

BasicDatatablePanel.prototype.enhanceTableColumns = function (data) {
    this.columnWidth["chkSelect"] = this.chkSelectNumberOfPixels;
    data.columns.forEach(function (column) {
        this.columnWidth[column.key] = (this.defaultNumberOfPixels > column.key.length ? this.defaultNumberOfPixels : column.key.length);
    }, this);
    this.columnWidth["Menu"] = this.menuColumnNumberOfPixels;
    return data;
};

BasicDatatablePanel.prototype.setFixedSizesForColumns = function () {
    this.datatable._displayColumns.forEach(function (column) {
        if (column.key != "chkSelect") {
            var columnKeyWidth = $('#' + column.id).width();
            var valueWidth = this.columnWidth[column.key];
            var appliedWidth = Math.max(columnKeyWidth, valueWidth);
            this.datatable.modifyColumn(column.key, {width: this.columnWidth[column.key] + "px"});
        }
    }, this);
    this.centralizeColumn("Menu");
};

/**
 * Checks if the panel has become too large to be displayed on the screen; it resizes the panel and adds scroll for the data
 * @private
 */
BasicDatatablePanel.prototype._resizeToFit = function () {
    var tableElem = $('#' + this.datatable.get('boundingBox').get('id'));
    var tableHeight = tableElem.height();
    var windowHeight = $(window).height();

    if (tableHeight > windowHeight) {
        this.datatable.set('height', windowHeight - tableElem.offset().top - 1);
        this._addScrollHandler();
    }
};

BasicDatatablePanel.prototype.centralizeColumn = function (columnName) {
    this.Y.all('.yui3-datatable-col-' + columnName).setStyle('text-align', 'center');
};


/**
 * Fetches the column data for the datatable. The function must be overloaded by the derived class and must return data as part of the callback in the specified format.
 * @param {columnDataCallback} callback
 */
BasicDatatablePanel.prototype.getColumnData = function (callback) {

};

/**
 * The column data callback
 *
 * @callback columnDataCallback
 * @param {Object} colData - Column Data to be used by the datatable
 * @param {Array} colData.columns - Array of columns names or YUI 3 Datatable column specification object. For further reference, check YUI3 Datatable documentation
 * @param {Array} colData.primaryKeys = Array of column names that will be used as primary keys for checkbox module. Only one column name may suffice.
 */

/**
 * Fetches the table data for the datatable. The function has to be overloaded and must return data in the class as specified.
 * @param {tableDataCallback} callback
 */
BasicDatatablePanel.prototype.getTableData = function (callback) {

};

/**
 * The table data callback
 *
 * @callback tableDataCallback
 * @param {Object} tableData - Table Data that's compatible with YUI 3 Datatable formats. It may consist of Array of objects with attributes as field key names or it may be an instance of
 * YUI 3 ModelList or an array of YUI3 Model objects.
 */


/**
 * Adds the handler for end of scrolling
 * @private
 */
BasicDatatablePanel.prototype._addScrollHandler = function () {
    var that = this;
    this.datatable._yScrollNode.on('scroll', function (e) {
        var scrollTop = this.datatable._yScrollNode.get('scrollTop');
        var innerHeight = $(this.datatable._yScrollNode._node).innerHeight();
        var elemHeight = $('#' + this.getPanelElement('.yui3-datatable-table').get('id')).height();
        if ((scrollTop + innerHeight) >= elemHeight) {
            that.endOfScrollHandler();
        }
    }, this);
};

/**
 * Function that is invoked when the datatable scroll has reached its end. It must be overloaded by the derived class.
 */
BasicDatatablePanel.prototype.endOfScrollHandler = function () {

};

BasicDatatablePanel.prototype.replaceDatatableValue = function (colName, currentValue, newValue) {
    this.datatable.data.each(function (model) {
        if (model.get(colName) == currentValue) {
            model.set(colName, newValue);
        }
    }, this);
};

BasicDatatablePanel.prototype.setDatatableValue = function (seed, colName, value) {
    this.datatable.getRecord(seed).set(colName, value);
};

/**
 * Refreshes the datatableby calling the getTableData() function again
 * @param {Function} callback - Callback function
 */
BasicDatatablePanel.prototype.refreshDatatable = function (callback) {
    var that = this;
    this.getTableData(function (tableData) {
        that.datatable.set('data', tableData);
        if (typeof callback !== "undefined") {
            callback();
        }
    });
};

/**
 * Returns the rows whose checkboxes are selected
 * @returns {Array} Array of YUI3 Model
 */
BasicDatatablePanel.prototype.getSelectedRows = function () {
    var selectedRows = [];
    this.datatable.get('checkboxSelected').forEach(function (row) {
        selectedRows.push(row.record);
    });
    return selectedRows;
};