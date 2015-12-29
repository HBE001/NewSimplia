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
 *
 * @param Y
 * @param properties
 * @constructor
 */
function CounterPanel(Y, properties) {
    //Calling base constructor
    BasicFormDatatablePanel.call(this, Y);

    //Default title
    this.panelTitle = "Counter Display";
    this.textTitle = "Counter";
    this.textValue = "Initial Value";

    this.relayServerCommand = "relayServerTip";
    this.getOpsCommand = "getoperations";
    this.doOpCommand = "dooperation";
    this.getCounterCommand = "getcounter";

    if(typeof properties === "object") {
        $.extend(this, properties);
        if(typeof properties.template === "object") {
            $.extend(this, properties.template);
        }
    }
}

//Inheriting from the base object
CounterPanel.prototype = Object.create(BasicFormDatatablePanel.prototype);

/**
 *
 * @param cb
 */
CounterPanel.prototype.init = function(cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    var that = this;
    BasicFormDatatablePanel.prototype.init.call(this, function(){
        if(typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 *
 */
CounterPanel.prototype.setupRightMenu = function() {
    //Always call the base class's function
    BasicFormDatatablePanel.prototype.setupRightMenu.call(this);

    var that = this;

    $.ajax({
        url: './' + this.typeNodeId + '/' + this.serverNodeId,
        type: 'POST',
        dataType: 'JSON',
        data: {command: this.relayServerCommand, data: JSON.stringify({command: this.getOpsCommand, role: this.role})},
        success: function(data) {
            for(var i in data){
                that.addRightMenuItem(data[i],function(label){
                    $.ajax({
                        url: './' + that.typeNodeId + '/' + that.serverNodeId,
                        type: 'POST',
                        dataType: 'JSON',
                        data: {command: that.relayServerCommand, data: JSON.stringify({command: that.doOpCommand, operation: label, role: that.role})},
                        success: function() {
                            that.refreshDatatable();
                        }
                    });
                });
            }
        }
    });
};

/**
 *
 * @param callback
 */
CounterPanel.prototype.getTableData = function(callback) {
    var that = this;
    $.ajax({
        url: './' + this.typeNodeId + '/' + this.serverNodeId,
        type: 'POST',
        dataType: 'JSON',
        data: {command: this.relayServerCommand, data: JSON.stringify({command: this.getCounterCommand})},
        success: function(data) {
            for(var i in data) {
                that[i] = data[i];
            }
            var tableData = [];
            that.textValue = '<div style="color:' + that.color + ';">' + that.counter + '</div>';
            tableData.push(that.addTableDataRow({type: 'text', value: that.textTitle}, {type: "text", value: that.textValue, metadata: {}}));
            callback(tableData);
        }
    });

};