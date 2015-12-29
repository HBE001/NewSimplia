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
 * Class for arranging the various display and sort settings of a datatable panel
 * @param {Object} Y - YUI Global Object
 * @param {Object} properties - Panel attributes
 * @constructor
 */

function DynamoFourColumnSettingsPanel(Y, properties) {
    //Calling base constructor
    BasicDatatablePanel.call(this, Y);

    this.originalData = [];

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
DynamoFourColumnSettingsPanel.prototype = Object.create(BasicDatatablePanel.prototype);

/**
 * Main initialization function
 * @param {Function} cb - Callback to be executed after all the initialization steps
 */
DynamoFourColumnSettingsPanel.prototype.init = function (cb) {
    var that = this;
    BasicDatatablePanel.prototype.init.call(this, function () {
        that._setInitialCheckboxes();
        that._setupLocalEventHandlers();
        that.centralizeColumn('Visibility');

        if (typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 * Overriden function to provide column data
 * @param {columnDataCallback} callback
 */
DynamoFourColumnSettingsPanel.prototype.getColumnData = function (callback) {
    var that = this;
    var colData = {
        columns: [
            {
                key: 'Field',
                label: 'Field'
            },
            {
                key: 'Length',
                label: 'Length',
                editor: "text"
            },
            {
                key: 'Visibility',
                label: 'Visibility',
                allowHTML:  true // to avoid HTML escaping
                //formatter: '<input type="checkbox"/>',
                //emptyCellValue: '<input type="checkbox"/>'
            }
        ],
        primaryKeys: ["Field"]
    };
    //callback(colData);
    callback(this.enhanceTableColumns(colData));
};

/**
 * Overriden function to provide table data
 * @param {tableDataCallback} callback
 */
DynamoFourColumnSettingsPanel.prototype.getTableData = function (callback) {
    var tableData = [];
    //Grab the list of columns from the parent panel
    console.log("Setting panel Get Data");
    //Always skip the first one as it would be the checkbox column
    var i = (this.parentPanel.datatableCheckbox ? 1 : 0)

    for (i; i < this.parentPanel.datatable.get('columns').length; i++) {
        var column = this.parentPanel.datatable.get('columns')[i];
        var record = {
            key: column.key,
            id: column.key,
            Field: column.key,
            Length: this.parentPanel.columnWidth[column.key],
            Visibility: '<input type="checkbox" value="'+ column.key +'" class="settings-panel-' + column.key + '" ' + (this.hiddenColumn.indexOf(column.key) == -1 ? 'checked' : '') + '/>'
        };
        tableData.push(record);
    }
    this.originalData = tableData;
    callback(tableData);
};

/**
 * Sets the checkboxes when the panel is first created
 * @private
 */
DynamoFourColumnSettingsPanel.prototype._setInitialCheckboxes = function () {
    //We need to grab the saved state of the panel; however, for now, set all the checkboxes
    this.datatable.checkboxSelectAll();
};

/**
 * Sets up the event handlers
 * @private
 */
DynamoFourColumnSettingsPanel.prototype._setupLocalEventHandlers = function () {
    this.datatable.getCellEditor("Length").on("editorSave", function (o) {
        console.log(o);
        if (o.oldValue != o.newValue) {
            this.replaceDatatableValue("Length", o.newValue, o.oldValue);
            console.log(this.datatable.data.toArray());
        }
    }, this);
};

/**
 * Overriden function to setup right menu items
 */
DynamoFourColumnSettingsPanel.prototype.setupRightMenu = function () {
    BasicDatatablePanel.prototype.setupRightMenu.call(this);
    this._addSaveOption();
    this._addShowAllOptions();
};

/**
 * Adds the option to save the settings panel
 * @private
 */
DynamoFourColumnSettingsPanel.prototype._addSaveOption = function () {
    var that = this;
    this.addRightMenuItem("Save", function () {
        that._resizePanelColumn();
        that._setVisibleColumn()
        that.hidePanel();
        //that.datatable.set('data', that.getSelectedRows());
    });
};

/**
 * Adds the option to show all fields instead of only the selected ones
 * @private
 */
DynamoFourColumnSettingsPanel.prototype._addShowAllOptions = function () {
    var that = this;
    this.addRightMenuItem("Show All", function () {
        that.datatable.set('data', that.originalData);
    });
};

/**
 * Sorts the parent panel as per the selected criteria
 * @private
 */
DynamoFourColumnSettingsPanel.prototype._resizePanelColumn = function () {
    var cols = this.datatable.data.toArray();
    cols = cols.filter(function (element) {
        return this.datatable._getCheckboxSelectedFlag(element);
    }, this);

    cols.forEach(function (col) {
        this.parentPanel.columnWidth[col.get('Field')] = col.get('Length');
    }, this);

    this.parentPanel.setFixedSizesForColumns();
    //this.parentPanel.datatable.set('data', this.parentPanel.createModelList(this.parentPanel.trimTableData()));
};

/**
 * Sorts the parent panel as per the selected criteria
 * @private
 */
DynamoFourColumnSettingsPanel.prototype._setVisibleColumn = function () {
    var cols = this.datatable.data.toArray();
    cols = cols.filter(function (element) {
        return this.datatable._getCheckboxSelectedFlag(element);
    }, this);

    cols.forEach(function (col) {
        console.log("Set Visible Column", col.get('Visibility'));
        var visibility = $(col.get('Visibility'))[0];
        console.log(visibility);
        console.log(visibility.value);
        console.log(visibility.checked);
        console.log($(".settings-panel-" + visibility.value).is(':checked'));
        if (!$(".settings-panel-" + visibility.value).is(':checked')){
            this.parentPanel.hideColumn(visibility.value)
        }else {
            this.parentPanel.showColumn(visibility.value)
        }
    }, this);
};


/**
 * Generates an array of columns of parent panel which have been selected
 * @returns {Array} List of objects containing panel information
 */
DynamoFourColumnSettingsPanel.prototype._getSelectedColumns = function () {
    //Since the columns attribute would change over time, always consult the original list
    var cols = this.parentPanel.originalColumns;

    var dataArray = this.datatable.data.toArray();
    var newCols = cols.filter(function (element, index) {
        return this.datatable._getCheckboxSelectedFlag(dataArray[index]);
    }, this);

    //Since the original list won't contain the checkbox, include it separately
    newCols.unshift((this.parentPanel.datatable.get('columns'))[0]);
    return newCols;
};
