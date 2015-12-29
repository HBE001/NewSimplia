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
function GenerateGDNFormPanel(Y, properties) {
    //Calling base constructor
    BasicFormDatatablePanel.call(this, Y);

    //Default title
    this.panelTitle = "GDN Generation Panel";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
    this.segmentCount = 1;
}

//Inheriting from the base object
GenerateGDNFormPanel.prototype = Object.create(BasicFormDatatablePanel.prototype);

/**
 *
 * @param cb
 */
GenerateGDNFormPanel.prototype.init = function(cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    BasicFormDatatablePanel.prototype.init.call(this, function(){
        if(typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 *
 */
GenerateGDNFormPanel.prototype.setupRightMenu = function() {
    //Always call the base class's function
    BasicFormDatatablePanel.prototype.setupRightMenu.call(this);

    this._addOutputOption();
};

/**
 *
 * @param callback
 */
GenerateGDNFormPanel.prototype.getTableData = function(callback) {
    var that = this;

    var tableData = [];

    tableData.push(this.addTableDataRow({type: 'text', value: "GUID"}, {type: "textbox", value: ''}));
    tableData.push(this.addTableDataRow({type: 'text', value: "Prefix"}, {type: "textbox", value: ''}));
    tableData.push(this.addTableDataRow({type: 'text', value: "Generate GDN"}, {type: "button", name: "Generate GDN", callback: this._generateGDN.bind(this)}));
    tableData.push(this.addTableDataRow({type: 'text', value: "GDN"}, {type: "readonly", value: ''}));

    callback(tableData);
};

GenerateGDNFormPanel.prototype._addOutputOption = function() {
    var that = this;
    this.addRightMenuItem("Output", function () {
        that.callback(that.getFormFieldValue("GDN"));
        that.hidePanel();
    })
};

GenerateGDNFormPanel.prototype._generateGDN = function() {
    var that = this;
    this.sendComponentData(
        this.parentPanel.parentPanel.typeNodeId,
        "none",
        "generateGDN",
        {
            Prefix: this.getFormFieldValue('Prefix'),
            GUID: this.getFormFieldValue('GUID'),
            Type: "Simple"
        },
        function(data) {
            if(data.error) {
                return console.log('error:', data.errorInfo);
            }
            that.setFormValue('GDN', {type: "readonly", value: data.gdn});
        }
    );
};
