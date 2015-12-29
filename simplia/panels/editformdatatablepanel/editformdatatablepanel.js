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

/**
 * Derived Form Datatable Panel class to edit database table rows
 * @param {Object} Y - YUI Global Object
 * @param {Object} properties - Panel attributes
 * @constructor
 */
function EditFormDatatablePanel(Y, properties) {
    //Calling base constructor
    BasicDatabaseFormDatatablePanel.call(this, Y);

    //Put the default value
    this.formMode = 'simple';

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
EditFormDatatablePanel.prototype = Object.create(BasicDatabaseFormDatatablePanel.prototype);

/**
 * Main init function that also selects the non-primary key field rows
 * @param cb
 */
EditFormDatatablePanel.prototype.init = function(cb) {
    var that = this;
    BasicDatabaseFormDatatablePanel.prototype.init.call(this, function(){
        that.selectInitialRows();
        if(typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 * Setting up the right mneu to add the following options:
 * Save - Making the update to the backend database system
 */
EditFormDatatablePanel.prototype.setupRightMenu = function() {
    BasicDatabaseFormDatatablePanel.prototype.setupRightMenu.call(this);

    var that = this;
    this.addRightMenuItem("Save",function(){
        var formData = that.collectSelectedFormData();
        $.ajax({
            url: that.parentPanel.updateUrl,
            type: "POST",
            dataType: "json",
            data: "table=" + that.parentPanel.tableName + "&row=" + JSON.stringify(formData) + "&ids=" +
                JSON.stringify(that.parentPanel.getTableIds(that.parentTableRowId)),
            success: function(data) {
                that.hidePanel();
                that.parentPanel.refreshDatatable();
            }
        })
    });
};

/**
 * Function that selects the initial set of database field rows. Currently, it selects the fields that are not primary keys
 */
EditFormDatatablePanel.prototype.selectInitialRows = function() {
    var recordIndices = [];
    this.datatable.data.toArray().forEach(function(model, index) {
        if($.inArray(model.get('id'), this.parentPanel.primaryKeys) == -1) {
            recordIndices.push(index);
        }
    }, this);
    this.datatable.set('checkboxSelected', recordIndices);
};