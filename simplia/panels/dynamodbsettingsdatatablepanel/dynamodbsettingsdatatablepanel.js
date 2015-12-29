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

function DynamoDBSettingsDatatablePanel(Y, properties) {
    //Calling base constructor
    BasicDatatablePanel.call(this, Y);

    this.sortOptions = {"1": "Up", "-1": "Down", "0": "None"};
    this.originalData = [];

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
DynamoDBSettingsDatatablePanel.prototype = Object.create(BasicDatatablePanel.prototype);

/**
 * Main initialization function
 * @param {Function} cb - Callback to be executed after all the initialization steps
 */
DynamoDBSettingsDatatablePanel.prototype.init = function (cb) {
    var that = this;
    BasicDatatablePanel.prototype.init.call(this, function () {
        that._setInitialCheckboxes();
        that._setupLocalEventHandlers();
        if (typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 * Overriden function to provide column data
 * @param {columnDataCallback} callback
 */
DynamoDBSettingsDatatablePanel.prototype.getColumnData = function (callback) {
    var that = this;
    var colData = {
        columns: [
            "Field",
            {
                key: 'Position',
                label: 'Position',
                editor: "select",
                editorConfig: {
                    selectOptions: this.createPositionsArray()
                }
            },
            {
                key: 'Sort',
                label: 'Sort',
                editor: "select",
                editorConfig: {
                    selectOptions: this.sortOptions
                },
                formatter: function (o) {
                    return that.sortOptions[o.value];
                }
            },
            {
                key: 'Length',
                label: 'Length',
                editor: "text"
                //editorConfig: {
                //    offsetXY: [5, 5]
                //}
            }
        ],
        primaryKeys: ["Field"]
    };
    callback(colData);
};

/**
 * Overriden function to provide table data
 * @param {tableDataCallback} callback
 */
DynamoDBSettingsDatatablePanel.prototype.getTableData = function (callback) {
    var tableData = [];
    //Grab the list of columns from the parent panel

    //Always skip the first one as it would be the checkbox column
    for (var i = 1; i < this.parentPanel.datatable.get('columns').length; i++) {
        var column = this.parentPanel.datatable.get('columns')[i];
        var record = {
            key: column.key,
            id: column.key,
            Field: column.label,
            Position: i,
            Sort: "0",
            Length: this.parentPanel.columnWidth[column.key]
        };
        tableData.push(record);
    }
    this.originalData = tableData;
    callback(tableData);
};

DynamoDBSettingsDatatablePanel.prototype.createPositionsArray = function () {
    var positionsArray = [];
    if (typeof this.numCols !== "undefined" && this.numCols) {
        for (var i = 1; i <= this.numCols; i++) {
            positionsArray.push({value: i, text: i});
        }
    }
    return positionsArray;
};

/**
 * Sets the checkboxes when the panel is first created
 * @private
 */
DynamoDBSettingsDatatablePanel.prototype._setInitialCheckboxes = function () {
    //We need to grab the saved state of the panel; however, for now, set all the checkboxes
    this.datatable.checkboxSelectAll();
};

/**
 * Sets up the event handlers
 * @private
 */
DynamoDBSettingsDatatablePanel.prototype._setupLocalEventHandlers = function () {
    this.datatable.getCellEditor("Position").on("editorSave", function (o) {
        if (o.oldValue != o.newValue) {
            this.replaceDatatableValue("Position", o.newValue, o.oldValue);
        }
    }, this);

    //
    //  Set a listener to DT's cell editor save event so that we can synchronize
    //    changes with a remote server (i.e. DataSource)
    //
    this.datatable.getCellEditor("Length").on("editorSave", function (o) {
    //this.datatable.after('cellEditorSave', function(o){
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
DynamoDBSettingsDatatablePanel.prototype.setupRightMenu = function () {
    BasicDatatablePanel.prototype.setupRightMenu.call(this);

    this._addSaveOption();
    this._addShowAllOptions();
    //this._addWhiteBoardPanel();
};

/**
 * Adds the option to save the settings panel
 * @private
 */
DynamoDBSettingsDatatablePanel.prototype._addSaveOption = function () {
    var that = this;
    this.addRightMenuItem("Save", function () {
        that._rearrangeParentPanelColumns();
        that._sortParentPanel();
        that._resizePanelColumn();
        that.hidePanel();
        that.datatable.set('data', that.getSelectedRows());
    });
};

/**
 * Adds the option to show all fields instead of only the selected ones
 * @private
 */
DynamoDBSettingsDatatablePanel.prototype._addShowAllOptions = function () {
    var that = this;
    this.addRightMenuItem("Show All", function () {
        that.datatable.set('data', that.originalData);
    });
};

/**
 * Rearranges the column order of the panel panel
 * @private
 */
DynamoDBSettingsDatatablePanel.prototype._rearrangeParentPanelColumns = function () {
    var cols = this._getSelectedColumns();

    var that = this;
    cols.sort(function (a, b) {
        //Checkbox always needs to be the first one
        if (a.key == "chkSelect") {
            return -1;
        }
        if (b.key == "chkSelect") {
            return 1;
        }
        if (that.datatable.data.getById(a.key).get('Position') < that.datatable.data.getById(b.key).get('Position')) {
            return -1;
        }
        return 1;
    });
    this.parentPanel.datatable.set('columns', cols);
};

/**
 * Sorts the parent panel as per the selected criteria
 * @private
 */
DynamoDBSettingsDatatablePanel.prototype._sortParentPanel = function () {
    var sortFields = [];

    var cols = this.datatable.data.toArray();

    cols = cols.filter(function (element) {
        return this.datatable._getCheckboxSelectedFlag(element);
    }, this);

    cols.sort(function (a, b) {
        if (a.get('Position') < b.get('Position')) {
            return -1;
        }
        return 1;
    });

    cols.forEach(function (col) {
        if (col.get('Sort')) {
            var sortField = {};
            sortField[col.get('Field')] = col.get('Sort');
            sortFields.push(sortField);
        }
    });

    if (sortFields.length) {
        this.parentPanel.datatable.sort(sortFields);
    }
};

/**
 * Sorts the parent panel as per the selected criteria
 * @private
 */
DynamoDBSettingsDatatablePanel.prototype._resizePanelColumn = function () {
    var cols = this.datatable.data.toArray();
    cols = cols.filter(function (element) {
        return this.datatable._getCheckboxSelectedFlag(element);
    }, this);

    cols.forEach(function (col) {
        this.parentPanel.columnWidth[col.get('Field')] =  col.get('Length');
    }, this);

    this.parentPanel.setFixedSizesForColumns();
    this.parentPanel.datatable.set('data', this.parentPanel.createModelList(this.parentPanel.trimTableData()));
};


/**
 * Generates an array of columns of parent panel which have been selected
 * @returns {Array} List of objects containing panel information
 */
DynamoDBSettingsDatatablePanel.prototype._getSelectedColumns = function () {
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

/* ------------------------------------------------------------- */
DynamoDBSettingsDatatablePanel.prototype._addWhiteBoardPanel = function () {
    var that = this;
    this.addChildPanel('whiteboardpanel', 'whiteboard', {
        panelTitle: "Whiteboard",
        parentPanel: this
    }, function (error, panel) {
        if (error) {
            console.log(error);
            return;
        }

        that.addRightMenuItem("Add Whiteboard", function () {
            panel.showPanel();
            panel.bringToTop(that);
            panel.startWhiteboard();
            panel.alignOverParent();
        });
    });
};
