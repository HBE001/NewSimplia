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
 * Base class for form-based datatable panel classes
 * @param {Object} Y - Global YUI Object
 * @param {Object} properties - Panel attributes
 * @constructor
 */
function DynamoDBBasicDatabaseFormDatatablePanel(Y, properties) {
    //Calling base constructor
    BasicDatatablePanel.call(this, Y);

    //Put the default value
    this.formMode = 'simple';
    this.parentTableRowId = '';

    this._buttonHandlers = {};

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
DynamoDBBasicDatabaseFormDatatablePanel.prototype = Object.create(BasicDatatablePanel.prototype);

/**
 * Main initialization function
 * @param {Function} cb - Callback function to be called
 */
DynamoDBBasicDatabaseFormDatatablePanel.prototype.init = function (cb) {
    var that = this;
    BasicDatatablePanel.prototype.init.call(this, function () {
        that._setupDatatableEventHandlers();
        if (typeof cb !== "undefined") {
            cb();
        }
    });

};

/**
 * Overriden function to prepare column data
 * @param {columnDataCallback} callback
 */
DynamoDBBasicDatabaseFormDatatablePanel.prototype.getColumnData = function (callback) {
    console.log("get COlumn Data");
    var colData = {
        columns: [
            {
                key: "Field",
                allowHTML: true,
                formatter: this._formFieldFormatter.bind(this)
            },
            {
                key: "Value",
                allowHTML: true,
                formatter: this._formValueFormatter.bind(this),
                emptyCellValue: '<input type="text"/>'
                //emptyCellValue: '<button type="button"/>'
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
DynamoDBBasicDatabaseFormDatatablePanel.prototype.getTableData = function (callback) {
    var tableData = [];
    //Grab the list of columns from the parent panel

    console.log("give Add Form Table Data");
    //Always skip the first one as it would be the checkbox column
    for (var i = 1; i < this.parentPanel.datatable.get('columns').length; i++) {
        var column = this.parentPanel.datatable.get('columns')[i];
        var record = {
            id: column.key,
            key: column.key,
            Field: column.label,
            Value: this.getFormFieldValue(column.key)
        };
        tableData.push(record);
    }
    tableData.push(this.addTableDataRow(
            "Save The Form",
            {
                type: "button", name: "Save", callback: function () {
                    console.log("Save Clicked");
                }
            }
        )
    );
    tableData.push(this.addTableDataRow(
            "Cancel and exit",
            {
                type: "button", name: "Cancel", callback: function () {
                console.log("Cancel Clicked");
            }
            }
        )
    );


    callback(tableData);
};

DynamoDBBasicDatabaseFormDatatablePanel.prototype._formFieldFormatter = function(o) {
    if(o.data.Value == undefined || (typeof o.data.Value.type !== "undefined") && o.data.Value.type == "button") {
        return "";
    }
    return o.value;
};


/**
 *
 * @param {Object} o
 * @returns {*}
 * @private
 */
DynamoDBBasicDatabaseFormDatatablePanel.prototype._formValueFormatter = function (o) {
    var that = this;
    var returning_type;

    if(o.value == undefined || (typeof o.value.type === "undefined") || !o.value.type) {
        returning_type = "simple";
    }else{
        returning_type = o.value.type;
    }

    console.log("Basic Form Value = ", o.value);
    var formatting = {
        'simple': function (o) {
            return '<input type="text" value="' + o.value + '"/>';
        },
        'readonly': function (o) {
            return '<input type="text" readonly value="' + o.value + '"/>';
        },
        'button': function (o) {
            var uid = 'btn_' + that.Y.Crypto.UUID();
            that._buttonHandlers[uid] = o.value.callback;
            var html = '<div class="datatable-button" data-uid="' + uid + '">' + o.value.name + '</div>';
            return html;
        }
    };
    return formatting[returning_type](o);
    //return formatting[this.formMode](o);
};

DynamoDBBasicDatabaseFormDatatablePanel.prototype.getFormFieldValue = function (key) {
    if (typeof this.formData !== "undefined") {
        return this.formData.get(key);
    }
    return '';
};

DynamoDBBasicDatabaseFormDatatablePanel.prototype.setFormMode = function (mode) {
    this.formMode = mode;

    //Possibly do more necessary UI related changes
};

DynamoDBBasicDatabaseFormDatatablePanel.prototype.setFormData = function (record) {
    this.parentTableRowId = record.get('id');

    this.datatable.data.toArray().forEach(function (model) {
        model.set('Value', record.get(model.get('id')));
    }, this);
};

DynamoDBBasicDatabaseFormDatatablePanel.prototype.collectFormData = function (noPrimaryKeys) {
    var data = {};

    this.datatable.data.toArray().forEach(function (model, index) {
        if ((typeof noPrimaryKeys === "undefined") || !noPrimaryKeys || ($.inArray(model.get('key'), this.parentPanel.primaryKeys) == -1)) {
            data[model.get('key')] = this.datatable.getCell([index, 2]).one('input').get('value');
        }
    }, this);
    return data;
};

DynamoDBBasicDatabaseFormDatatablePanel.prototype.collectSelectedFormData = function () {
    var data = {};
    this.datatable.get('checkboxSelected').forEach(function (row) {
        data[row.record.get('key')] = this.datatable.getRow(row.record).one('td input[type=text]').get('value');
    }, this);

    return data;
};

DynamoDBBasicDatabaseFormDatatablePanel.prototype.addTableDataRow = function (field, value) {
    console.log("Table DataRow Field = ", field);
    console.log("Table DataRow Value = ", value);
    return {
        id: this.Y.Crypto.UUID(),
        Field: field,
        Value: value
    };
};

DynamoDBBasicDatabaseFormDatatablePanel.prototype.setFormValue = function (field, value) {
    this.datatable.data.toArray().some(function (model) {
        if (model.get('Field') == field) {
            model.set('Value', value);
            return true;
        }
        return false;
    }, this);
};

DynamoDBBasicDatabaseFormDatatablePanel.prototype._setupDatatableEventHandlers = function () {
    this.datatable.delegate('click', function (e) {
        if (typeof this._buttonHandlers[e.currentTarget.getData('uid')] !== "undefined") {
            this._buttonHandlers[e.currentTarget.getData('uid')].call();
        }
    }, '.datatable-button', this);
};

