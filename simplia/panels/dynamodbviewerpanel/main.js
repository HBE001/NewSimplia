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
 *
 * @param Y
 * @param properties
 * @constructor
 */
function DynamodbViewerPanel(Y, properties) {
    //Calling base constructor
    BasicDatatablePanel.call(this, Y);

    //Default title
    this.panelTitle = "Dynamodb Viewer";
    this.metatype = "";
    this.setQueryPanelName = "querypanel"

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
DynamodbViewerPanel.prototype = Object.create(BasicDatatablePanel.prototype);

/**
 *
 * @param cb
 */
DynamodbViewerPanel.prototype.init = function(cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    var that = this;
    BasicDatatablePanel.prototype.init.call(this, function(){
        if(typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 *
 */
DynamodbViewerPanel.prototype.setupRightMenu = function() {
    //Always call the base class's function
    BasicDatatablePanel.prototype.setupRightMenu.call(this);

    this.addResetTableOption();
    this._addSetQueryOption();
    this.addRefreshOption();
};

/**
 *
 * @param callback
 */
DynamodbViewerPanel.prototype.getTableData = function(callback) {
    this.sendComponentData(
        this.typeNodeId,
        this.serverNodeId,
        "relayServerTip",
        {
            command: "gettabledata",
            metatype: this.metatype
        },
        function(data) {
            if(typeof data.error !== "undefined" && data.error) {
                return console.log('error:', data.errorInfo);
            }
            callback(data.data);
        }
    )
};

DynamodbViewerPanel.prototype.getColumnData = function(callback) {
    this.sendComponentData(
        this.typeNodeId,
        this.serverNodeId,
        "relayServerTip",
        {
            command: "getcolumndata"
        },
        function(data) {
            if(typeof data.error !== "undefined" && data.error) {
                return console.log('error:', data.errorInfo);
            }
            callback(data);
        }
    )
};


DynamodbViewerPanel.prototype._addSetQueryOption = function() {
    var that = this;
    this.addRightMenuItem("Set Query", function(){
        var panel;
        if(!(panel = that.childPanel(that.setQueryPanelName))) {
            var formData = [];

            formData.push([{type: 'text', value: "Metatype"}, {type: "textbox", value:''}]);
            formData.push([{type: 'text', value: "Run"}, {type: "button", name: "Run", callback: function(){ that._runQuery(); }}]);


            that.createChildFormPanel(that.setQueryPanelName, "Data Viewer", formData, function(error, panel) {
                if(error) {
                    return console.log('error:', error);
                }
                panel.showPanel();
            });
        }
        else {
            panel.showPanel();
        }
    });
};

DynamodbViewerPanel.prototype._runQuery = function() {
    var panel = this.childPanel(this.setQueryPanelName);
    var formData = panel.collectFormData();
    this.metatype = formData['Metatype'];
    panel.hidePanel();
    this.refreshDatatable();
};