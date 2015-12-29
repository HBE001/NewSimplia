/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * ? 2010-2015 Lotus Interworks Inc. (?LIW?) Proprietary and Trade Secret.
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
function DynDBInputFormPanel(Y, properties) {
    //Calling base constructor
    BasicFormDatatablePanel.call(this, Y);

    //Default title
    this.panelTitle = "DynamoDB Input Form";
    this.newRowNegIndex = 2;
    this.getSchemaUrl = "./metadata/getschema";
    this.saveUrl = "./metadata/save";
    this.openUrl = "./metadata/open";

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
DynDBInputFormPanel.prototype = Object.create(BasicFormDatatablePanel.prototype);

/**
 *
 * @param cb
 */
DynDBInputFormPanel.prototype.init = function (cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    var that = this;
    BasicFormDatatablePanel.prototype.init.call(this, function () {
        if (typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 *
 */
DynDBInputFormPanel.prototype.setupRightMenu = function () {
    //Always call the base class's function
    BasicFormDatatablePanel.prototype.setupRightMenu.call(this);
    this._addResetOption();
    this._addSaveOption();
    this._addOpenOption();
};

/**
 *
 * @param callback
 */
DynDBInputFormPanel.prototype.getTableData = function (callback, dataValues) {
    var that = this;

    var tableData = [];

    tableData.push(
        this.addTableDataRow(
            {type: 'text', value: "Table Name"},
            {type: "text", value: this.tableName},
            "tableName"
        )
    );

    this.doAjaxJSONCall(
        this.getSchemaUrl,
        {tableName: this.tableName, updateTime: this.updateTime},
        function (data) {
            if (typeof data.error !== "undefined") {
                return console.log('Error:', data.error);
            }
            var attributeType = {
                'ID': function (attr) {
                    var value = (dataValues == undefined || dataValues[attr.Name] == undefined ? '' : dataValues[attr.Name]);
                    return that.addTableDataRow({type: 'text', value: attr.Name}, {
                        type: "textbox-id",
                        value: value
                    });
                },
                'OST': function (attr) {
                    var value = (dataValues == undefined || dataValues[attr.Name] == undefined ? '' : dataValues[attr.Name]);
                    return that.addTableDataRow({type: 'text', value: attr.Name}, {
                        type: "textbox-ost",
                        value: value
                    });
                },
                'ODN': function (attr) {
                    var value = (dataValues == undefined || dataValues[attr.Name] == undefined ? '' : dataValues[attr.Name]);
                    return that.addTableDataRow({type: 'text', value: attr.Name}, {
                        type: "textbox-odn",
                        value: value
                    });
                },
                'OES': function (attr) {
                    var value = (dataValues == undefined || dataValues[attr.Name] == undefined ? '' : dataValues[attr.Name]);
                    return that.addTableDataRow({type: 'text', value: attr.Name}, {
                        type: "textbox-oes",
                        value: value
                    });
                },
                'Map': function (attr) {
                    var value = (dataValues == undefined || dataValues[attr.Name] == undefined ? '' : dataValues[attr.Name]);
                    return that.addTableDataRow({type: 'text', value: attr.Name}, {
                        type: "textbox-map",
                        value: value
                    });
                },
                'default': function (attr) {
                    var value = (dataValues == undefined || dataValues[attr.Name] == undefined ? '' : dataValues[attr.Name]);
                    return that.addTableDataRow({type: 'text', value: attr.Name}, {
                        type: "textbox",
                        value: value
                    });
                }
            };

            data.data.forEach(function (attribute) {
                var type = (typeof attributeType[attribute.OxygenPType] !== "undefined") ? (attribute.OxygenPType) : ('default');
                tableData.push(attributeType[type](attribute));
            });
            callback(tableData);
        }
    );
};

DynDBInputFormPanel.prototype._addSaveOption = function () {
    var that = this;
    this.addRightMenuItem("Save", function () {
        var formData = that.collectFormData(["tableName"]);
        //that._setStatus(JSON.stringify(formData));
        var data = {
            tableName: that.tableName,
            data: JSON.stringify(formData)
        };

        that.doAjaxJSONCall(that.saveUrl, $.param(data), function (data) {

        });
    });
};

DynDBInputFormPanel.prototype._addOpenOption = function () {
    var that = this;
    this.addRightMenuItem("Open", function () {
        var formData = that.collectFormData(["tableName"]);
        //that._setStatus(JSON.stringify(formData));
        var data = {
            tableName: that.tableName,
            data: JSON.stringify(formData)
        };

        that.doAjaxJSONCall(that.openUrl, $.param(data), function (data) {
            console.log("Open Response is here");
            var loaded_data = data.data;
            that.refreshDatatable(undefined, loaded_data);
        });
    });
};

DynDBInputFormPanel.prototype._addResetOption = function () {
    var that = this;
    this.addRightMenuItem("Reset", function () {
        that.resetPanel();
    });
};

/**
 * Refreshes the datatableby calling the getTableData() function again
 * @param {Function} callback - Callback function
 */
DynDBInputFormPanel.prototype.refreshDatatable = function (callback, loaded_data) {
    var that = this;
    this.getTableData(function (tableData) {
        that.datatable.set('data', tableData);
        if (typeof callback !== "undefined") {
            callback();
        }
    }, loaded_data);
};
