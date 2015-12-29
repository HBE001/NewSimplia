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
 * Base class for form-based datatable panel classes
 * @param {Object} Y - Global YUI Object
 * @param {Object} properties - Panel attributes
 * @constructor
 */
function BasicDatabaseFormDatatablePanel(Y, properties) {
    //Calling base constructor
    BasicDatatablePanel.call(this, Y);

    //Put the default value
    this.formMode = 'simple';
    this.parentTableRowId = '';
    this._buttonHandlers = {};

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
BasicDatabaseFormDatatablePanel.prototype = Object.create(BasicDatatablePanel.prototype);

/**
 * Main initialization function
 * @param {Function} cb - Callback function to be called
 */
BasicDatabaseFormDatatablePanel.prototype.init = function(cb) {
    var that = this;
    BasicDatatablePanel.prototype.init.call(this, function(){
        that._setupValuePanel();
        that._setupDatatableEventHandlers();
        if(typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 * Overriden function to prepare column data
 * @param {columnDataCallback} callback
 */
BasicDatabaseFormDatatablePanel.prototype.getColumnData = function(callback) {
    var colData = {
        columns: [
            "Field",
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
BasicDatabaseFormDatatablePanel.prototype.getTableData = function(callback) {
    var tableData = [];
    //Grab the list of columns from the parent panel

    //Always skip the first one as it would be the checkbox column
    for(var i = 1; i < this.parentPanel.datatable.get('columns').length; i++) {
        var column = this.parentPanel.datatable.get('columns')[i];
        var record = {
            id: column.key,
            key: column.key,
            Field: column.label,
            Value: this.getFormFieldValue(column.key)
        };
        tableData.push(record);
    }
    callback(tableData);
};

/**
 *
 * @param {Object} o
 * @returns {*}
 * @private
 */
BasicDatabaseFormDatatablePanel.prototype._formValueFormatter = function(o) {
    var that = this;
    if(o.value === null) {
        o.value = "";
    }
    var formatting = {
        'simple': function(o) {
            var value = '';
            if(o.value.length < 50) {
                value = '<input type="text" value="' + o.value + '"/>';
            }
            else {
                var uid = 'btn_' + that.Y.Crypto.UUID();
                that._buttonHandlers[uid] = {
                    fn: that.displayValue,
                    thisObj: that,
                    args: [o.value, o.data.id]
                };
                value = '<div class="datatable-button" data-uid="' + uid + '">View Value</div>';

            }
            return value;
        },
        'readonly': function(o) {
            return '<input type="text" readonly value="' + o.value + '"/>';
        }
    };
    return formatting[this.formMode](o);
};

BasicDatabaseFormDatatablePanel.prototype.getFormFieldValue = function(key) {
    if(typeof this.formData !== "undefined") {
        return this.formData.get(key);
    }
    return '';
};

BasicDatabaseFormDatatablePanel.prototype.setFormMode = function(mode) {
    this.formMode = mode;

    //Possibly do more necessary UI related changes
};

BasicDatabaseFormDatatablePanel.prototype.setFormData = function(record) {
    this.parentTableRowId = record.get('id');

    this.datatable.data.toArray().forEach(function(model){
        model.set('Value', record.get(model.get('id')));
    }, this);
};

BasicDatabaseFormDatatablePanel.prototype.collectFormData = function(noPrimaryKeys) {
    var data = {};

    this.datatable.data.toArray().forEach(function(model,index){
        if((typeof noPrimaryKeys === "undefined") || !noPrimaryKeys || ($.inArray(model.get('key'),this.parentPanel.primaryKeys) == -1)) {
            var value = "";
            if(this.datatable.getCell([index, 2]).one('input')) {
                value = this.datatable.getCell([index, 2]).one('input').get('value');
            }
            else {
                value = model.get('Value');
            }
            data[model.get('key')] = value;
        }
    },this);
    return data;
};

BasicDatabaseFormDatatablePanel.prototype.collectSelectedFormData = function() {
    var data = {};
    this.datatable.get('checkboxSelected').forEach(function(row){
        var value = ""
        if(this.datatable.getRow(row.record).one('td input[type=text]')) {
            value = this.datatable.getRow(row.record).one('td input[type=text]').get('value');
        }
        else {
            value = row.record.get('Value');
        }
        data[row.record.get('key')] = value;
    },this);

    return data;
};

BasicDatabaseFormDatatablePanel.prototype._setupDatatableEventHandlers = function() {
    this.datatable.delegate('click', function(e){
        if(typeof this._buttonHandlers[e.currentTarget.getData('uid')] !== "undefined") {
            var handlerObj = this._buttonHandlers[e.currentTarget.getData('uid')];
            handlerObj.fn.apply(handlerObj.thisObj, handlerObj.args);
        }
    },'.datatable-button', this);
};

BasicDatabaseFormDatatablePanel.prototype.displayValue = function(value, id) {
    this.childPanels['viewvalue'].setFormValue('Value',  {type: "textarea", value: value, metadata:{id: id}});
    this.childPanels['viewvalue'].showPanel();
    this.childPanels['viewvalue'].bringToTop(this);
};

BasicDatabaseFormDatatablePanel.prototype._setupValuePanel = function() {
    this.addChildPanel(
        'largetextpanel',
        'viewvalue',
        {
            panelTitle: "View Value",
            parentPanel: this
        },
        function(error, panel) {
            if (error) {
                console.log(error);
                return;
            }
        }
    );
};