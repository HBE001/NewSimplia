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
function OESInputFormPanel(Y, properties) {
    //Calling base constructor
    BasicFormDatatablePanel.call(this, Y);

    //Default title
    this.panelTitle = "DynamoDB Input Form";
    this.newRowNegIndex = 2;
    this.getSchemaUrl = "./metadata/getschema";
    this.saveUrl = "./metadata/save";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
    this.segmentCount = 1;
}

//Inheriting from the base object
OESInputFormPanel.prototype = Object.create(BasicFormDatatablePanel.prototype);

/**
 *
 * @param cb
 */
OESInputFormPanel.prototype.init = function(cb) {
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
OESInputFormPanel.prototype.setupRightMenu = function() {
    //Always call the base class's function
    BasicFormDatatablePanel.prototype.setupRightMenu.call(this);

    this._addOutputOption();
};

/**
 *
 * @param callback
 */
OESInputFormPanel.prototype.getTableData = function(callback) {
    var that = this;

    var tableData = [];

    tableData.push(this.addTableDataRow({type: 'text', value: "String Encoding"}, {type: "textbox", value: ''},"stringEncoding"));
    tableData.push(this.addTableDataRow({type: 'text', value: "Add Segment"}, {type: "button", name: "Add Segment", callback: this._addSegmentRows.bind(this)}));

    callback(tableData);
};

OESInputFormPanel.prototype._addOutputOption = function() {
    var that = this;
    this.addRightMenuItem("Output", function () {
        var formData = that.collectFormData(["tableName","Segment Number"]);

        var OESString = formData.stringEncoding;
        for(var i = 1; i < that.segmentCount; i++) {
            var segmentEncodingField = 'segment' + i + 'Encoding';
            var segmentField = 'segment' + i;
            if((formData[segmentEncodingField] !== "") && (formData[segmentField] !== "")) {
                OESString += formData[segmentEncodingField] + formData[segmentField] + String.fromCharCode(127);
            }
        }
        OESString += String.fromCharCode(127);
        that.callback(OESString);
        that.hidePanel();
    })
};

OESInputFormPanel.prototype._addSegmentRows = function() {
    var segment = this.segmentCount++;
    this.datatable.data.add(
        this.addTableDataRow({type: 'text', value: "Segment Number"}, {type: "text", value: segment}),
        {index: this.datatable.data.size() - 1}
    );
    this.datatable.data.add(
        this.addTableDataRow({type: 'text', value: "Segment Encoding"}, {type: "textbox", value: ''}, 'segment' + segment + 'Encoding'),
        {index: this.datatable.data.size() - 1}
    );
    this.datatable.data.add(
        this.addTableDataRow({type: 'text', value: "Segment"}, {type: "textbox", value: ''}, 'segment' + segment),
        {index: this.datatable.data.size() - 1}
    );
};

OESInputFormPanel.prototype.resetPanel = function() {
    var removeIndices = [];
    for(var i = 1; i < this.datatable.data.size() - 1; i++) {
        removeIndices.push(i);
    }
    this.datatable.data.remove(removeIndices);
    this.setFormValue("stringEncoding", "");

    this.segmentCount = 1;
};