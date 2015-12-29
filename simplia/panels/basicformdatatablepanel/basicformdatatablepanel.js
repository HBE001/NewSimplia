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
function BasicFormDatatablePanel(Y, properties) {
    //Calling base constructor
    BasicDatatablePanel.call(this, Y);

    this._buttonHandlers = {};
    this.datatableCheckbox = false;
    this._fieldColIndex = 0;
    this._valueColIndex = 2;
    this.guidUrl = "./guid/get";
    this.gdnUrl = "./gdn/get";
    this.OESEditorPanelName = "oeseditor";
    this.OESEditorPanelType = "oesinputformpanel";

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
BasicFormDatatablePanel.prototype = Object.create(BasicDatatablePanel.prototype);

/**
 * Main initialization function
 * @param {Function} cb - Callback function to be called
 */
BasicFormDatatablePanel.prototype.init = function (cb) {
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
BasicFormDatatablePanel.prototype.getColumnData = function (callback) {
    var colData = {
        columns: [
            {
                key: "Field",
                allowHTML: true,
                formatter: this._formFormatter.bind(this)
            },
            {
                key: "Value",
                allowHTML: true,
                formatter: this._formFormatter.bind(this),
                emptyCellValue: '<input type="text"/>'
            }
        ],
        primaryKeys: ["Field"]
    };
    callback(colData);
};

/**
 *
 * @param {Object} o
 * @returns {*}
 * @private
 */
BasicFormDatatablePanel.prototype._formFormatter = function (o) {
    var retVal = '';
    if ((typeof o.value.type === "undefined") || !o.value.type) {
        o.value.type = "default";
    } else if (o.column.key != "Value" && o.data.Value.type == "button") {
        return "";
    }

    var that = this;

    var formatting = {
        'textbox': function (o) {
            return '<input type="text" value="' + o.value.value + '"/>';
        },
        'textbox-map': function (o) {
            var uid = 'btn_' + that.Y.Crypto.UUID();
            var html = '<input type="text" id="txt_' + uid + '" value="' + JSON.stringify(o.value.value) + '"/>';
            that._buttonHandlers[uid] = that._createJSONEditor.bind(that, uid, function (guid) {
                $('#txt_' + uid).val(guid)
            });
            html += '<div class="datatable-button" data-uid="' + uid + '">Open JSON Editor</div>';
            return html;
        },
        'textbox-id': function (o) {
            var uid = 'btn_' + that.Y.Crypto.UUID();
            var html = '<input type="text" id="txt_' + uid + '" value="' + o.value.value + '"/>';
            that._buttonHandlers[uid] = that._getGUID.bind(that, function (guid) {
                $('#txt_' + uid).val(guid)
            });
            html += '<div class="datatable-button" data-uid="' + uid + '">Get GUID</div>';
            return html;
        },
        'textbox-ost': function (o) {
            var uid = 'btn_' + that.Y.Crypto.UUID();

            var html = '<input type="text" id="txt_' + uid + '" value="' + o.value.value + '"/>';
            that._buttonHandlers[uid] = that._generateOST.bind(that, function (ost) {
                $('#txt_' + uid).val(ost)
            });
            html += '<div class="datatable-button" data-uid="' + uid + '">Generate OST</div>';
            return html;
        },
        'textbox-odn': function (o) {
            var uid = 'btn_' + that.Y.Crypto.UUID();
            var html = '<input type="text" id="txt_' + uid + '" value="' + o.value.value + '"/>';
            that._buttonHandlers[uid] = that._getGDN.bind(that, uid, function (gdn) {
                $('#txt_' + uid).val(gdn)
            });
            html += '<div class="datatable-button" data-uid="' + uid + '">Generate GDN</div>';
            return html;
        },
        'textbox-oes': function (o) {
            var uid = 'btn_' + that.Y.Crypto.UUID();
            var html = '<input type="text" id="txt_' + uid + '" value="' + o.value.value + '"/>';
            that._buttonHandlers[uid] = that._displayOESEditor.bind(that, function (oes) {
                $('#txt_' + uid).val(oes)
            });
            html += '<div class="datatable-button" data-uid="' + uid + '">Create OES</div>';
            return html;
        },
        'password': function (o) {
            return '<input type="password" value="' + o.value.value + '"/>';
        },
        'readonly': function (o) {
            return '<input type="text" readonly value="' + o.value.value + '"/>';
        },
        'list': function (o) {
            var html = '<select>';
            for (var i in o.value.value) {
                html += '<option value="' + i + '">' + o.value.value[i] + '</option>';
            }
            return html + '</select>';
        },
        'button': function (o) {
            var uid = 'btn_' + that.Y.Crypto.UUID();
            that._buttonHandlers[uid] = o.value.callback;
            var html = '<div class="datatable-button" data-uid="' + uid + '">' + o.value.name + '</div>';
            return html;
        },
        'text': function (o) {
            return '<div>' + o.value.value + '</div>';
        },
        'textarea': function (o) {
            return '<textarea cols="50" rows="10">' + o.value.value + '</textarea>';
        },
        'default': function (o) {
            return '<input type="text" value="' + o.value.value + '"/>';
        }
    };
    return formatting[o.value.type](o);
};

BasicFormDatatablePanel.prototype.getFormFieldValue = function (key) {
    if (typeof this.formData !== "undefined") {
        return this.formData.get(key);
    }
    return '';
};


BasicFormDatatablePanel.prototype.collectFormData = function (skip) {
    var data = {};

    this.datatable.data.toArray().forEach(function (model, index) {
        var value;
        if (value = this._getColumnValue(index, this._valueColIndex, model.get('Value'))) {
            var field = model.get('customId') ? model.get('id') : this._getColumnValue(index, this._fieldColIndex, model.get('Field'));
            if (!($.isArray(skip)) || ($.inArray(field, skip) == -1)) {
                data[field] = value;
            }
        }
    }, this);
    return data;
};

BasicFormDatatablePanel.prototype.collectSelectedFormData = function () {
    var data = {};
    this.datatable.get('checkboxSelected').forEach(function (row) {
        data[row.record.get('Field')] = this.datatable.getRow(row.record).one('td input[type=text]').get('value');
    }, this);

    return data;
};

BasicFormDatatablePanel.prototype._setupDatatableEventHandlers = function () {
    this.datatable.delegate('click', function (e) {
        if (typeof this._buttonHandlers[e.currentTarget.getData('uid')] !== "undefined") {
            this._buttonHandlers[e.currentTarget.getData('uid')].call();
        }
    }, '.datatable-button', this);
};

BasicFormDatatablePanel.prototype.setFormValue = function (field, value) {
    this.datatable.data.toArray().some(function (model) {
        if (model.get('Field').value == field) {
            model.set('Value', value);
            return true;
        }
        return false;
    }, this);
};

BasicFormDatatablePanel.prototype.getFormValue = function (field) {
    var returnVal = false;
    this.datatable.data.toArray().some(function (model) {
        if (model.get('Field').value == field) {
            returnVal = model.get('Value');
            return true;
        }
        return false;
    }, this);
    return returnVal;
};


BasicFormDatatablePanel.prototype.addTableDataRow = function (field, value, id) {
    return {
        id: id || this.Y.Crypto.UUID(),
        customId: (typeof id !== "undefined"),
        Field: field,
        Value: value
    };
};

BasicFormDatatablePanel.prototype._getColumnValue = function (rowIndex, colIndex, field) {
    var that = this;
    var value = {
        'textbox': function () {
            return that.datatable.getCell([rowIndex, colIndex]).one('input').get('value');
        },
        'textbox-id': function () {
            return that.datatable.getCell([rowIndex, colIndex]).one('input').get('value');
        },
        'textbox-ost': function () {
            return that.datatable.getCell([rowIndex, colIndex]).one('input').get('value');
        },
        'textbox-odn': function () {
            return that.datatable.getCell([rowIndex, colIndex]).one('input').get('value');
        },
        'textbox-oes': function () {
            return that.datatable.getCell([rowIndex, colIndex]).one('input').get('value');
        },
        'textbox-map': function () {
            var value = that.datatable.getCell([rowIndex, colIndex]).one('input').get('value');
            var obj = {};
            if (value && (obj = that._tryParseJSON(value))) {
                return obj;
            }
            return value;
        },
        'text': function (field) {
            return field.value;
        },
        'password': function () {
            return that.datatable.getCell([rowIndex, colIndex]).one('input').get('value');
        },
        'textarea': function () {
            return that.datatable.getCell([rowIndex, colIndex]).one('textarea').get('value');
        }
    };
    if (typeof value[field.type] !== "undefined") {
        return value[field.type](field);
    }
    return "";
};

BasicFormDatatablePanel.prototype._tryParseJSON = function (jsonString) {
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns 'null', and typeof null === "object",
        // so we must check for that, too.
        if (o && typeof o === "object" && o !== null) {
            return o;
        }
    }
    catch (e) {
    }

    return false;
};

BasicFormDatatablePanel.prototype._getGUID = function (callback) {
    this.doAjaxJSONCall(this.guidUrl, "", function (data) {
        if (typeof data.error !== "undefined") {
            return console.log('Error:', data.error);
        }
        if (typeof callback !== "undefined") {
            callback(data.guid)
        }
    }, "GET");
};

BasicFormDatatablePanel.prototype._getGDN = function (button_uid, callback) {
    var formData = this.collectFormData(["tableName"]);
    params = {
        guid: formData.Node,
        prefix: $('#txt_' + button_uid).val(),
        type: 'Simple'
    }
    this.doAjaxJSONCall(this.gdnUrl, $.param(params), function (data) {
        if (typeof data.error !== "undefined") {
            return console.log('Error:', data.error);
        }
        if (typeof callback !== "undefined") {
            callback(data.gdn)
        }
    }, "GET");
};

BasicFormDatatablePanel.prototype._createJSONEditor = function (button_uid, callback) {
    var that = this;
    this.addChildPanel('jsoneditorpanel', 'JSON Editor', {
        panelTitle: "JSON Editor",
        parentPanel: this,
        parentCallBack: callback,
        jsonValue: $('#txt_' + button_uid).val()
    }, function (error, panel) {
        if (error) {
            console.log(error);
        } else {
            panel.showPanel();
            panel.bringToTop(that);
        }
    });
};


BasicFormDatatablePanel.prototype._generateOST = function (callback) {
    var time = (new Date()).toISOString();
    callback(time);
};

BasicFormDatatablePanel.prototype._displayOESEditor = function (callback) {
    var childPanel = this.childPanel(this.OESEditorPanelName);

    if (childPanel) {
        childPanel.resetPanel();
        childPanel.set('callback', callback);
        childPanel.showPanel();
    } else {
        var properties = {
            callback: callback,
            parentPanel: this
        };
        this.addChildPanel(this.OESEditorPanelType, this.OESEditorPanelName, properties, function (error, panel) {
            if (error) {
                return console.log('Error:', error);
            }
            panel.showPanel();
        })
    }
};

BasicFormDatatablePanel.prototype.resetPanel = function (skip) {
    this.datatable.data.toArray().forEach(function (model, index) {
        var field = model.get('customId') ? model.get('id') : this._getColumnValue(index, this._fieldColIndex, model.get('Field'));
        if (!($.isArray(skip)) || ($.inArray(field, skip) == -1)) {
            this._resetColumn(index, this._valueColIndex, model.get('Value'));
        }
    }, this);
};

BasicFormDatatablePanel.prototype._resetColumn = function (rowIndex, colIndex, field) {
    var that = this;
    var column = {
        'textbox': function () {
            that.datatable.getCell([rowIndex, colIndex]).one('input').set('value', '');
        },
        'textbox-id': function () {
            that.datatable.getCell([rowIndex, colIndex]).one('input').set('value', '');
        },
        'textbox-ost': function () {
            that.datatable.getCell([rowIndex, colIndex]).one('input').set('value', '');
        },
        'textbox-oes': function () {
            that.datatable.getCell([rowIndex, colIndex]).one('input').set('value', '');
        },
        'textbox-map': function () {
            that.datatable.getCell([rowIndex, colIndex]).one('input').set('value', '');
        },
        'text': function (field) {

        },
        'password': function () {
            that.datatable.getCell([rowIndex, colIndex]).one('input').set('value', '');
        },
        'textarea': function () {
            that.datatable.getCell([rowIndex, colIndex]).one('textarea').set('value', '');
        }
    };
    if (typeof column[field.type] !== "undefined") {
        column[field.type](field);
    }
};
