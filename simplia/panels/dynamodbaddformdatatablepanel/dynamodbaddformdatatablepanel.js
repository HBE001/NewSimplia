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
 * Derived Form Datatable Panel class to add new rows to a database table
 * @param {Object} Y - Global YUI Object
 * @param properties
 * @constructor
 */
function DynamoDBAddFormDatatablePanel(Y, properties) {
    //Calling base constructor
    DynamoDBBasicDatabaseFormDatatablePanel.call(this, Y);

    //Put the default value
    this.formMode = 'simple';
    this.addUrl = "./datatableservices/addrow";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
DynamoDBAddFormDatatablePanel.prototype = Object.create(DynamoDBBasicDatabaseFormDatatablePanel.prototype);

/**
 * Main init function
 * @param cb
 */
DynamoDBAddFormDatatablePanel.prototype.init = function(cb) {
    var that = this;
    DynamoDBBasicDatabaseFormDatatablePanel.prototype.init.call(this, function(){
        that.selectInitialRows();
        //that.setupLocalEventHandlers();
        if(typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 * Overloaded function to add options to the right menu of the panel
 */
DynamoDBAddFormDatatablePanel.prototype.setupRightMenu = function() {
    DynamoDBBasicDatabaseFormDatatablePanel.prototype.setupRightMenu.call(this);

    var that = this;
    this.addRightMenuItem("Save",function(){
        var formData = that.collectSelectedFormData();
        $.ajax({
            url: that.addUrl,
            type: "POST",
            dataType: "json",
            data: "table=" + that.parentPanel.tableName + "&row=" + JSON.stringify(formData),
            success: function(data) {
                that.hidePanel();
                that.parentPanel.refreshDatatable();
            }
        })
    });

    /* ------------------------------------------------------------- */
    //this.addChildPanel('whiteboardpanel', 'whiteboard', {panelTitle: "Whiteboard", parentPanel: this}, function(error, panel){
    //    if(error) {
    //        console.log(error);
    //        return;
    //    }
    //
    //    that.addRightMenuItem("Add Whiteboard", function(){
    //        panel.showPanel();
    //        panel.bringToTop(that);
    //        panel.startWhiteboard();
    //        panel.alignOverParent();
    //    });
    //});
};

/**
 * Selects the initial set of rows; it excludes the primary key fields
 */
DynamoDBAddFormDatatablePanel.prototype.selectInitialRows = function() {
    var recordIndices = [];
    this.datatable.data.toArray().forEach(function(model, index) {
        if(this.parentPanel.auto_increment != model.get('id')) {
            recordIndices.push(index);
        }
    }, this);
    this.datatable.set('checkboxSelected', recordIndices);
};

/**
 * Settings up the various event handlers, including resetting the form fields before being displayed
 */
DynamoDBAddFormDatatablePanel.prototype.setupLocalEventHandlers = function() {
    this.panel.on('visibleChange', function(e){
        //Before displaying the form, empty all the previous values
        if(e.newVal) {
            this.datatable.data.toArray().forEach(function(model){
                this.datatable.getRow(model).one('td input[type=text]').set('value', '');
            },this)
        }
    },this);
};