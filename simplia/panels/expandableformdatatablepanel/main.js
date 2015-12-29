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

function ExpandableFormDatatablePanel(Y, properties) {
    //Calling base constructor
    BasicDatatablePanel.call(this, Y);

    //Put the default value
    this.newRowFieldName = "new-row-field";
    this.newRowValueName = "new-row-value";

    this.addRowButtonClassName = "expandable-form-new-row-button";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
ExpandableFormDatatablePanel.prototype = Object.create(BasicDatatablePanel.prototype);

/**
 * Main init function
 * @param cb
 */
ExpandableFormDatatablePanel.prototype.init = function(cb) {
    var that = this;
    BasicDatatablePanel.prototype.init.call(this, function(){
        that._setupLocalEventHandlers();
        if(typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 * Overriden function to prepare column data
 * @param {columnDataCallback} callback
 */
ExpandableFormDatatablePanel.prototype.getColumnData = function(callback) {
    var colData = {
        columns: [
            {
                key: "Field",
                allowHTML: true,
                formatter: this._formValueFormatter.bind(this),
                emptyCellValue: '<input type="text"/>'
            },
            {
                key: "Value",
                allowHTML: true,
                formatter: this._formValueFormatter.bind(this),
                emptyCellValue: '<input type="text"/>'
            }
        ],
        primaryKeys: ["Field"]
    };
    callback(colData);
};

/**
 * Overriden function to prepare table data
 * @param {tableDataCallback} callback
 */
ExpandableFormDatatablePanel.prototype.getTableData = function(callback) {
    var tableData = [];

    tableData.push({
        id: this.Y.Crypto.UUID(),
        Field: '',
        Value: ''
    });

    tableData.push({
        id: this.Y.Crypto.UUID(),
        Field: this.newRowFieldName,
        Value: this.newRowValueName
    });

    callback(tableData);
};

/**
 *
 * @param {Object} o
 * @returns {*}
 * @private
 */
ExpandableFormDatatablePanel.prototype._formValueFormatter = function(o) {
    var formatting = {};

    var that = this;
    formatting[this.newRowValueName] = function(o) {
        return '<input type="button" value="New Row" class="' + that.addRowButtonClassName + '">';
    };
    formatting[this.newRowFieldName] = function(o) {
        return ' ';
    };
    if(typeof formatting[o.value] !== "undefined") {
        return formatting[o.value](o);
    }
    return '<input type="text" value="' + o.value + '"/>';
};

/**
 *
 * @private
 */
ExpandableFormDatatablePanel.prototype._setupLocalEventHandlers = function() {
    this.datatable.delegate("click",function(e){
        this._addRow();
    },"." + this.addRowButtonClassName, this);
};

/**
 *
 * @private
 */
ExpandableFormDatatablePanel.prototype._addRow = function() {
    this.datatable.data.add({
        id: this.Y.Crypto.UUID(),
        Field: '',
        Value: ''
    }, { index: this.datatable.data.size() - 1});
};