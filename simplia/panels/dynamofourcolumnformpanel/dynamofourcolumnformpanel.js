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
function DynamoFourColumnFormPanel(Y, properties) {
    //Calling base constructor
    BasicFourColumnFormDataTablePanel.call(this, Y);

    //Default title
    this.panelTitle = "DynamoDB Input Form";
    this.getSchemaUrl = "./metadata/getschema";
    this.saveUrl = "./metadata/save";
    this.openUrl = "./metadata/open";
    this.gdnUrl = "./gdn/get";
    this.gdn_parameter;
    this.context_parameter;
    this.loadedDataItem;
    this.loadedcontext;


    //this.newRowNegIndex = 2;
    this.selectionVisible = true;
    this.tagArray = {
        TableName: "tableName",
        Node: "textbox-id",
        Edge: "string",
        UpdateTime: "dateTime",
        CreationTime: "dateTime",
        T1: "dateTime",
        T2: "dateTime",
        MetaType: "string",
        Status: "radioButtons",
        LockSet: "telephone",
        DisplayName: "textbox-odn",
        CycleCount: "currency",
        InitialContext: "json-context",
        CurrentContext: "json-context",
        FinalContext: "json-context",
        Code: "json",
        Content: "json",
        OwnerID: 'string',
        OrganizationID: 'string',
        AccountID: 'string',
        OwnerDN: 'string',
        OrganizationDN: 'string',
        AccountDN: 'string',
        Family: "string",
        Type: "string",
        RootTemplate: "string",
        Template: "string"
    };

    if (typeof properties === "object") {
        $.extend(this, properties);
    }

    //$.extend(that.widgetsContainer.tagArray, {
    //    Role: "string",
    //    Input: "string",
    //    Current_State: "string",
    //    Next_State: "string",
    //    Output: "string",
    //    Cycle: "string",
    //    Save_Button: 'save_bfst_state'
    //});
    //$.extend(that.widgetsContainer.formattingArray, {save_bfst_state: ""});
}

//Inheriting from the base object
DynamoFourColumnFormPanel.prototype = Object.create(BasicFourColumnFormDataTablePanel.prototype);

/**
 *
 * @param cb
 */
DynamoFourColumnFormPanel.prototype.init = function (cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it

    var that = this;
    if (this.gdn_parameter == undefined || this.gdn_parameter == "") {
        this.gdn_parameter = this.getUrlParameter("gdn") || "";
    }

    if (this.tableName == undefined || this.tableName == "") {
        this.tableName = this.getUrlParameter("tableName") || "";
    }
    //if (that.gdn_parameter != undefined && that.gdn_parameter != "") {
    //    that.tableName = (that.getUrlParameter("tableName") != undefined && that.getUrlParameter("tableName") != "" ?
    //        that.getUrlParameter("tableName") : "OxygenComponents");
    //    that.context_parameter = that.getUrlParameter("context");
    //}

    BasicFourColumnFormDataTablePanel.prototype.init.call(this, function () {
        //$.getScript("./js/htmlparser.js", function () {
        //    console.log("html Parser");
        //    $.getScript("./js/html2json.js", function () {
        //        console.log("HTML 2 JSON");
        //        that._addBuildSchemaOption();
        //    });
        //});

        if (typeof cb !== "undefined") {
            // We Add feature that depends on loaded data
            that._addSaveAsFinal();
            that._addSaveAsDraft();
            that._addCreateATip();
            that._addCreateATemplate();
            that._addCreateARootTemplate();
            that._addSettingsPanel();
            cb();
        }
    });
};

/**
 *
 */
DynamoFourColumnFormPanel.prototype.setupRightMenu = function () {
    //Always call the base class's function
    BasicFourColumnFormDataTablePanel.prototype.setupRightMenu.call(this);
    //this._addSettingsPanel();
    this._addHideSelection();
    this._addShowSelection();
    //this._changeTagValue_2();
    //this._changeTagValue_1();
    this._addResetOption();
    //this._addSaveOption();
    this._addOpenOption();
    //}
};

/**
 *
 * @param callback
 */
DynamoFourColumnFormPanel.prototype.getTableData = function (callback, dataValues) {
    console.log("GET TABLE DATA ============> ");
    console.log(this.tableName);
    var that = this;
    var tableData = [];

    tableData.push(
        this.addTableDataRow(
            {type: 'text-field', value: "Table Name"},
            {type: "text", value: this.tableName},
            {type: that.tagArray["TableName"], value: ""},
            "tableName"
        )
    );

    var loadedSchema = {};
    var loadedData = dataValues || [];
    if (this.tableName && this.tableName != "") {
        this.doAjaxJSONCall(
            this.getSchemaUrl,
            {tableName: this.tableName},
            function (schema) {
                loadedSchema = schema;
                console.log("Loaded SChema = ");
                console.log(loadedSchema);
                console.log("Check if need to load Data");
                console.log("dataValues");
                console.log(dataValues);
                console.log("that.gdn_parameter");
                console.log(that.gdn_parameter);

                if (dataValues == undefined && that.gdn_parameter && that.gdn_parameter != "") {
                    console.log("Will Load the Data");
                    var displayNameArray = {};
                    displayNameArray.DisplayName = that.gdn_parameter;
                    var data = {
                        tableName: that.tableName,
                        data: JSON.stringify(displayNameArray)
                    };
                    that.doAjaxJSONCall(that.openUrl, $.param(data), function (data) {
                        loadedData = data.data;
                        console.log("Loaded Data = ");
                        console.log(loadedData);
                        that.renderTable(tableData, loadedSchema, loadedData, callback);
                    });
                } else {
                    that.renderTable(tableData, loadedSchema, loadedData, callback);
                }
            }
        );
    } else {
        callback(tableData);
    }
};

DynamoFourColumnFormPanel.prototype.renderTable = function (tableData, schema, dataValues, callback) {
    var that = this;
    if (typeof schema !== "undefined" && typeof schema.error !== "undefined") {
        return console.log('Error:', schema.error);
    }

    var attributeType = {
        'ID': function (attr) {
            var value = (dataValues == undefined || dataValues[attr.Name] == undefined ? '' : dataValues[attr.Name]);
            return that.addTableDataRow(
                {type: 'text-field', value: attr.Name},
                {type: 'text', value: value, trimedvalue: that.trimCellData(attr.Name, value)},
                {
                    type: (that.tagArray[attr.Name] == undefined ? "string" : that.tagArray[attr.Name]),
                    value: value
                }
            );
        },
        'OST': function (attr) {
            var value = (dataValues == undefined || dataValues[attr.Name] == undefined ? '' : dataValues[attr.Name]);
            return that.addTableDataRow(
                {type: 'text-field', value: attr.Name},
                {type: 'text', value: value, trimedvalue: that.trimCellData(attr.Name, value)},
                {
                    type: (that.tagArray[attr.Name] == undefined ? "string" : that.tagArray[attr.Name]),
                    value: value
                }
            );
        },
        'ODN': function (attr) {
            var value = (dataValues == undefined || dataValues[attr.Name] == undefined ? '' : dataValues[attr.Name]);
            return that.addTableDataRow(
                {type: 'text-field', value: attr.Name},
                {type: 'text', value: value, trimedvalue: that.trimCellData(attr.Name, value)},
                {
                    type: (that.tagArray[attr.Name] == undefined ? "string" : that.tagArray[attr.Name]),
                    value: value
                }
            );
        },
        'OES': function (attr) {
            var value = (dataValues == undefined || dataValues[attr.Name] == undefined ? '' : dataValues[attr.Name]);
            return that.addTableDataRow(
                {type: 'text-field', value: attr.Name},
                {type: 'text', value: value, trimedvalue: that.trimCellData(attr.Name, value)},
                {
                    type: (that.tagArray[attr.Name] == undefined ? "string" : that.tagArray[attr.Name]),
                    value: value
                }
            );
        },
        'Map': function (attr) {
            var value = (dataValues == undefined || dataValues[attr.Name] == undefined ? '' : dataValues[attr.Name]);
            return that.addTableDataRow(
                {type: 'text-field', value: attr.Name},
                {
                    type: 'text',
                    value: value,
                    trimedvalue: that.trimCellData(attr.Name, value),
                    specialValue: true
                },
                {
                    type: (that.tagArray[attr.Name] == undefined ? "string" : that.tagArray[attr.Name]),
                    value: value
                }
            );
        },
        'default': function (attr) {
            var value = (dataValues == undefined || dataValues[attr.Name] == undefined ? '' : dataValues[attr.Name]);
            return that.addTableDataRow(
                {type: 'text-field', value: attr.Name},
                {type: 'text', value: value, trimedvalue: that.trimCellData(attr.Name, value)},
                {
                    type: (that.tagArray[attr.Name] == undefined ? "string" : that.tagArray[attr.Name]),
                    value: value
                }
            );
        }
    };

    if (schema != undefined && schema != "" && schema.data != undefined && schema.data != "") {
        schema.data.forEach(function (attribute) {
            var type = (typeof attributeType[attribute.OxygenPType] !== "undefined") ? (attribute.OxygenPType) : ('default');
            tableData.push(attributeType[type](attribute));
        });
    }
    if (tableData.length == 0) {
        tableData.push(
            this.addTableDataRow(
                {type: 'text-field', value: "Table Name"},
                {type: "text", value: this.tableName},
                {type: that.tagArray["TableName"], value: ""},
                "tableName"
            )
        );
    }
    callback(tableData);
}

DynamoFourColumnFormPanel.prototype._addSaveOption = function () {
    var that = this;
    this.addRightMenuItem("Save", function () {
        var data = {
            tableName: that.tableName,
            data: JSON.stringify(that.collectFormData(["tableName"]))
        };
        that.doAjaxJSONCall(that.saveUrl, $.param(data));
    });
};

DynamoFourColumnFormPanel.prototype._addOpenOption = function () {
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
            console.log(data);
            var loaded_data = data.data;
            that.refreshDatatable(undefined, loaded_data);
        });
    });
};

DynamoFourColumnFormPanel.prototype._addResetOption = function () {
    var that = this;
    this.addRightMenuItem("Reset", function () {
        that.resetPanel();
    });
};

DynamoFourColumnFormPanel.prototype._changeTagValue_1 = function () {
    var that = this;
    this.addRightMenuItem("ChangeTag_1", function () {
        that.tagArray = {
            Node: "textbox-id", Edge: "string", UpdateTime: "dateTime", T1: "dateTime", T2: "dateTime"
        };
        that.refreshDatatable();
    });
};

DynamoFourColumnFormPanel.prototype._changeTagValue_2 = function () {
    var that = this;
    this.addRightMenuItem("ChangeTag_2", function () {
        that.tagArray = {
            Node: "textbox-id",
            Edge: "string",
            UpdateTime: "string",
            T1: "string",
            T2: "string"
        };
        that.refreshDatatable();
    });
};

DynamoFourColumnFormPanel.prototype._addShowSelection = function () {
    var that = this;
    this.addRightMenuItem("Show Selection", function () {
        if (!that.selectionVisible) {
            that.selectionVisible = true;
            that.datatable._displayColumns.forEach(function (column) {
                if (column.key == "chkSelect") {
                    that.Y.all('.yui3-datatable-col-' + column.key).setStyle('display', 'block');
                    that.hiddenColumn.splice(that.hiddenColumn.indexOf(column.key), 1);
                }
            }, that);
        }
    });
};

DynamoFourColumnFormPanel.prototype._addHideSelection = function () {
    var that = this;
    this.addRightMenuItem("Hide Selection", function () {
        if (that.selectionVisible) {
            that.selectionVisible = false;
            that.datatable._displayColumns.forEach(function (column) {
                if (column.key == "chkSelect") {
                    that.Y.all('.yui3-datatable-col-' + column.key).setStyle('display', 'none');
                    that.hiddenColumn[column.key];
                }
            }, that);
        }
    });
};


DynamoFourColumnFormPanel.prototype.showColumn = function (columnName) {
    this.datatable._displayColumns.forEach(function (column) {
        if (column.key == columnName && this.hiddenColumn.indexOf(column.key) != -1) {
            this.Y.all('.yui3-datatable-col-' + column.key).setStyle('display', 'block');
            this.hiddenColumn.splice(this.hiddenColumn.indexOf(column.key), 1);
        }
    }, this);
};

DynamoFourColumnFormPanel.prototype.hideColumn = function (columnName) {
    this.datatable._displayColumns.forEach(function (column) {
        if (column.key == columnName && this.hiddenColumn.indexOf(column.key) == -1) {
            this.Y.all('.yui3-datatable-col-' + column.key).setStyle('display', 'none');
            this.hiddenColumn.push(column.key);
        }
    }, this);
};

DynamoFourColumnFormPanel.prototype._addCreateARootTemplate = function () {
    var that = this;
    that.addRightMenuItem("Create A Root Template", function () {
        that.createNewOxygenComponent("RootTemplate");
    });
};

DynamoFourColumnFormPanel.prototype._addCreateATemplate = function () {
    var that = this;
    this.addRightMenuItem("Create A Template", function () {
        that.createNewOxygenComponent("Template");
    });
};

DynamoFourColumnFormPanel.prototype._addCreateATip = function () {
    var that = this;
    this.addRightMenuItem("Create A Tip", function () {
        that.createNewOxygenComponent("Tip");
    });
};

DynamoFourColumnFormPanel.prototype.createNewOxygenComponent = function (metaType) {
    var that = this;
    that.stringValueWidget.callbackFunction = (function () {
        that.setStringValueListner("", "Enter Display Name", function (displayName) {
            that.doAjaxJSONCall(that.guidUrl, "", function (guid) {
                console.log("NEW GUID = ");
                console.log(guid);

                that.doAjaxJSONCall(that.gdnUrl, $.param({
                    guid: guid.guid,
                    prefix: displayName,
                    type: 'Simple'
                }), function (gdn) {
                    console.log("NEW GDN = ");
                    console.log(gdn);

                    var template = (that.getFormValue('MetaType').value == 'Template' ? that.getFormValue('DisplayName').value : "" );
                    var rootTemplate = (that.getFormValue('MetaType').value == 'RootTemplate' ? that.getFormValue('DisplayName').value :
                        (that.getFormValue('MetaType').value == 'Template' ? that.getFormValue('RootTemplate').value : "" ));
                    var context = (
                        that.getFormValue('FinalContext').value != undefined &&
                        that.getFormValue('FinalContext').value != "" &&
                        that.getFormValue('FinalContext').value != {} &&
                        that.getFormValue('FinalContext').value != {"": ""} ? that.getFormValue('FinalContext').value :
                            that.getFormValue('CurrentContext').value != undefined &&
                            that.getFormValue('CurrentContext').value != "" &&
                            that.getFormValue('CurrentContext').value != {} &&
                            that.getFormValue('CurrentContext').value != {"": ""} ? that.getFormValue('CurrentContext').value : that.getFormValue('InitialContext').value);

                    var tableData = {
                        tableName: that.tableName,
                        data: JSON.stringify({
                            Node: guid.guid,
                            Edge: (that.getFormValue('Edge').value != "" ? that.getFormValue('Edge').value : "Self"),
                            MetaType: metaType,
                            DisplayName: gdn.gdn,
                            Type: (that.getFormValue('Type').value != "" ? that.getFormValue('Type').value : null),
                            RootTemplate: (rootTemplate != "" ? rootTemplate : null),
                            Template: (template != "" ? template : null),
                            InitialContext: (context != "" ? context : null),
                            Code: (that.getFormValue('Code').value != "" ? that.getFormValue('Code').value : null)
                        })
                    };
                    that.doAjaxJSONCall(that.saveUrl, $.param(tableData), function (saveResult) {
                        console.log("Save Result = ");
                        console.log(saveResult);

                        // adding the refernce in the HTML mapge if found
                        if ($('.dynamictable')[0] != undefined) {
                            var table = $('.dynamictable').children();
                            table.append("<tr><td style='padding: 15px; border: 1px solid #DDD;'>" +
                                "<a style='color: #000000;' href='javascript:void(0);' onclick='loadComponent(\""
                                + gdn.gdn + "\")' target='_blank'>" + gdn.gdn + "</a></td></tr>");
                        }
                    });
                }, "GET");
            }, "GET");
        });
    });
    that.stringValueWidget.activate();
};

DynamoFourColumnFormPanel.prototype.makeReadOnlyForm = function (context) {
    var readOnlyData = (context.ApplicationClientData != undefined && context.ApplicationClientData.data != undefined ? JSON.parse(context.ApplicationClientData.data) : {"": ""});
    var schema = context.ApplicationClientTemplate.schema || "";
    console.log("COMA SCHEMA = ", schema);
    for (var key in readOnlyData) {
        if (readOnlyData.hasOwnProperty(key)) {
            console.log(key + " -> " + readOnlyData[key]);
            if (readOnlyData[key] != "") {
                console.log("will Edit", key, readOnlyData[key]);
                schema = schema.replace("\"value\": \"${" + key + "}\",", "\"value\": \"${" + key + "}\",\"readonly\": \"true\",");
                console.log("Edited COMA SCHEMA = ", schema);
            }
        }
    }
    context.ApplicationClientTemplate.schema = schema;
    return context;
}

DynamoFourColumnFormPanel.prototype._addSaveAsDraft = function () {
    var that = this;
    this.addRightMenuItem("Save As Draft", function () {
        var FinalContextExist = (
            that.getFormValue('FinalContext').value != undefined &&
            that.getFormValue('FinalContext').value != "" &&
            that.getFormValue('FinalContext').value != {} &&
            that.getFormValue('FinalContext').value != {"": ""} ? true : false);

        if (!FinalContextExist) {
            var context = (
                that.getFormValue('CurrentContext').value != undefined &&
                that.getFormValue('CurrentContext').value != "" &&
                that.getFormValue('CurrentContext').value != {} &&
                that.getFormValue('CurrentContext').value != {"": ""} ? that.getFormValue('CurrentContext').value : that.getFormValue('InitialContext').value);

            that.setFormValue("CurrentContext", {
                type: 'text',
                value: context,
                specialValue: true
            });

            var data = {
                tableName: that.tableName,
                data: JSON.stringify(that.collectFormData(["tableName"]))
            };
            that.doAjaxJSONCall(that.saveUrl, $.param(data));
        } else {
            alert("Error: It's Final " + that.getFormValue('MetaType').value);
        }
    });
};

DynamoFourColumnFormPanel.prototype._addSaveAsFinal = function () {
    var that = this;
    this.addRightMenuItem("Save As Final", function () {
        var FinalContextExist = (
            that.getFormValue('FinalContext').value != undefined &&
            that.getFormValue('FinalContext').value != "" &&
            that.getFormValue('FinalContext').value != {} &&
            that.getFormValue('FinalContext').value != {"": ""} ? true : false);

        if (!FinalContextExist) {
            var context = (
                that.getFormValue('CurrentContext').value != undefined &&
                that.getFormValue('CurrentContext').value != "" &&
                that.getFormValue('CurrentContext').value != {} &&
                that.getFormValue('CurrentContext').value != {"": ""} ? that.getFormValue('CurrentContext').value : that.getFormValue('InitialContext').value);

            //context = that.makeReadOnlyForm(context);
            console.log("Context to Save as Final = ");
            console.log(context);

            that.setFormValue("FinalContext", {
                type: 'text',
                value: context,
                specialValue: true
            });

            var data = {
                tableName: that.tableName,
                data: JSON.stringify(that.collectFormData(["tableName"]))
            };
            that.doAjaxJSONCall(that.saveUrl, $.param(data));

        } else {
            alert("Error: It's Final " + that.getFormValue('MetaType').value);
        }
    });
};

//DynamoFourColumnFormPanel.prototype._addBuildSchemaOption = function () {
//    var that = this;
//    this.addRightMenuItem("Build Table Schema", function () {
//        console.log("Building the schema");
//        ////console.log($('table'));
//        ////console.log($('table')[0]);
//        ////console.log($('<div>').append($('table').clone()).html());
//        //console.log(html2json($('<div>').append($('table').clone()).html()));
//        //var stringJSON = JSON.stringify(htmlJsonSchme);
//        //var stringJSON = html2json($('<div>').append($('table').clone()).html()) + "";
//        var htmlJsonSchme = html2json($('<div>').append($('table').clone()).html());
//        console.log(" < ================================================ > ");
//        console.log(htmlJsonSchme);
//        console.log(" < ================================================ > ");
//        console.log(JSON.stringify(htmlJsonSchme));
//        console.log(" < ================================================ > ");
//        console.log(JSON.stringify(htmlJsonSchme).split('child').join('children'));
//        console.log(" < ================================================ > ");
//        console.log(that.removeProp(htmlJsonSchme, 'attr'));
//        console.log(" < ================================================ > ");
//        console.log(JSON.stringify(that.removeProp(htmlJsonSchme, 'attr')));
//        console.log(" < ================================================ > ");
//        console.log(JSON.stringify(that.removeProp(htmlJsonSchme, 'attr')).split('child').join('children'));
//        console.log(" < ================================================ > ");
//        //
//        var context = (
//            that.getFormValue('CurrentContext').value != undefined &&
//            that.getFormValue('CurrentContext').value != "" &&
//            that.getFormValue('CurrentContext').value != {} &&
//            that.getFormValue('CurrentContext').value != {"": ""} ? that.getFormValue('CurrentContext').value : that.getFormValue('InitialContext').value);
//
//        if (context == "" || context == undefined) {
//            context = {};
//        }
//        if (context.ApplicationClientTemplate == undefined) {
//            context.ApplicationClientTemplate = {};
//        }
//        //var html2JSON = '{"tag":"table","attr":{"cellspacing":"0","class":["yui3-datatable-table"],"id":"yui_3_18_0_1_1446764187260_1833"},"child":[{"tag":"colgroup","attr":{"id":"yui_3_18_0_1_1446764187260_1872"},"child":[{"tag":"col"},{"tag":"col","attr":{"style":"width: 150px;"}},{"tag":"col","attr":{"style":"width: 150px;"}},{"tag":"col","attr":{"style":"width: 150px;"}}]},{"tag":"thead","attr":{"class":["yui3-datatable-columns"],"id":"yui_3_18_0_1_1446764187260_1836"},"child":[{"tag":"tr","child":[{"tag":"th","attr":{"id":"yui_3_18_0_1_1446764187260_1759","colspan":"1","rowspan":"1","class":["yui3-datatable-header","yui3-datatable-first-header","yui3-datatable-col-chkSelect"],"scope":"col","data-yui3-col-id":"chkSelect"},"child":[{"tag":"input","attr":{"type":"checkbox","class":["yui3-datatable-checkbox-select-all"],"title":"Select ALL records"}}]},{"tag":"th","attr":{"id":"yui_3_18_0_1_1446764187260_1593","colspan":"1","rowspan":"1","class":["yui3-datatable-header","yui3-datatable-col-Field"],"scope":"col","data-yui3-col-id":"Field"},"text":"Field"},{"tag":"th","attr":{"id":"yui_3_18_0_1_1446764187260_1594","colspan":"1","rowspan":"1","class":["yui3-datatable-header","yui3-datatable-col-Length"],"scope":"col","data-yui3-col-id":"Length"},"text":"Length"},{"tag":"th","attr":{"id":"yui_3_18_0_1_1446764187260_1595","colspan":"1","rowspan":"1","class":["yui3-datatable-header","yui3-datatable-col-Visibility"],"scope":"col","data-yui3-col-id":"Visibility","style":"text-align: center;"},"text":"Visibility"}]}]},{"tag":"tbody","attr":{"class":["yui3-datatable-message"],"id":"yui_3_18_0_1_1446764187260_1887"},"child":[{"tag":"tr","child":[{"tag":"td","attr":{"class":["yui3-datatable-message-content"],"colspan":"4"}}]}]},{"tag":"tbody","attr":{"class":["yui3-datatable-data"],"id":"yui_3_18_0_1_1446764187260_1877"},"child":[{"tag":"tr","attr":{"id":"yui_3_18_0_1_1446764187260_1851","data-yui3-record":"model_36","class":["yui3-datatable-even",""]},"child":[{"tag":"td","attr":{"class":["yui3-datatable-col-chkSelect","","yui3-datatable-cell","","center"]},"child":[{"tag":"input","attr":{"type":"checkbox","class":["yui3-datatable-checkbox-select"]}}]},{"tag":"td","attr":{"class":["yui3-datatable-col-Field","","yui3-datatable-cell",""]},"text":"chkSelect"},{"tag":"td","attr":{"class":["yui3-datatable-col-Length","","yui3-datatable-cell",""]},"text":"32"},{"tag":"td","attr":{"class":["yui3-datatable-col-Visibility","","yui3-datatable-cell",""],"style":"text-align: center;"},"child":[{"tag":"input","attr":{"type":"checkbox","value":"chkSelect","class":["settings-panel-chkSelect"],"checked":"checked"}}]}]},{"tag":"tr","attr":{"id":"yui_3_18_0_1_1446764187260_1852","data-yui3-record":"model_37","class":["yui3-datatable-odd",""]},"child":[{"tag":"td","attr":{"class":["yui3-datatable-col-chkSelect","","yui3-datatable-cell","","center"]},"child":[{"tag":"input","attr":{"type":"checkbox","class":["yui3-datatable-checkbox-select"]}}]},{"tag":"td","attr":{"class":["yui3-datatable-col-Field","","yui3-datatable-cell",""]},"text":"Name"},{"tag":"td","attr":{"class":["yui3-datatable-col-Length","","yui3-datatable-cell",""]},"text":"150"},{"tag":"td","attr":{"class":["yui3-datatable-col-Visibility","","yui3-datatable-cell",""],"style":"text-align: center;"},"child":[{"tag":"input","attr":{"type":"checkbox","value":"Name","class":["settings-panel-Name"],"checked":"checked"}}]}]},{"tag":"tr","attr":{"id":"yui_3_18_0_1_1446764187260_1853","data-yui3-record":"model_38","class":["yui3-datatable-even",""]},"child":[{"tag":"td","attr":{"class":["yui3-datatable-col-chkSelect","","yui3-datatable-cell","","center"]},"child":[{"tag":"input","attr":{"type":"checkbox","class":["yui3-datatable-checkbox-select"]}}]},{"tag":"td","attr":{"class":["yui3-datatable-col-Field","","yui3-datatable-cell",""]},"text":"Value"},{"tag":"td","attr":{"class":["yui3-datatable-col-Length","","yui3-datatable-cell",""]},"text":"150"},{"tag":"td","attr":{"class":["yui3-datatable-col-Visibility","","yui3-datatable-cell",""],"style":"text-align: center;"},"child":[{"tag":"input","attr":{"type":"checkbox","value":"Value","class":["settings-panel-Value"],"checked":"checked"}}]}]},{"tag":"tr","attr":{"id":"yui_3_18_0_1_1446764187260_1854","data-yui3-record":"model_39","class":["yui3-datatable-odd",""]},"child":[{"tag":"td","attr":{"class":["yui3-datatable-col-chkSelect","","yui3-datatable-cell","","center"]},"child":[{"tag":"input","attr":{"type":"checkbox","class":["yui3-datatable-checkbox-select"]}}]},{"tag":"td","attr":{"class":["yui3-datatable-col-Field","","yui3-datatable-cell",""]},"text":"Menu"},{"tag":"td","attr":{"class":["yui3-datatable-col-Length","","yui3-datatable-cell",""]},"text":"32"},{"tag":"td","attr":{"class":["yui3-datatable-col-Visibility","","yui3-datatable-cell",""],"style":"text-align: center;"},"child":[{"tag":"input","attr":{"type":"checkbox","value":"Menu","class":["settings-panel-Menu"],"checked":"checked"}}]}]}]}]}'.split('child').join('children');
//        //var obj = JSON.parse(html2JSON);
//        //that.removeProp(obj, 'attr');
//        //html2JSON = JSON.stringify(obj);
//        //console.log("html2JSON ==================> ");
//        //console.log(html2JSON);
//        //context.ApplicationClientTemplate.schema = '{"tag":"table","attr":{"cellspacing":"0","class":["yui3-datatable-table"],"id":"yui_3_18_0_1_1446764187260_1833"},"child":[{"tag":"colgroup","attr":{"id":"yui_3_18_0_1_1446764187260_1872"},"child":[{"tag":"col"},{"tag":"col","attr":{"style":"width: 150px;"}},{"tag":"col","attr":{"style":"width: 150px;"}},{"tag":"col","attr":{"style":"width: 150px;"}}]},{"tag":"thead","attr":{"class":["yui3-datatable-columns"],"id":"yui_3_18_0_1_1446764187260_1836"},"child":[{"tag":"tr","child":[{"tag":"th","attr":{"id":"yui_3_18_0_1_1446764187260_1759","colspan":"1","rowspan":"1","class":["yui3-datatable-header","yui3-datatable-first-header","yui3-datatable-col-chkSelect"],"scope":"col","data-yui3-col-id":"chkSelect"},"child":[{"tag":"input","attr":{"type":"checkbox","class":["yui3-datatable-checkbox-select-all"],"title":"Select ALL records"}}]},{"tag":"th","attr":{"id":"yui_3_18_0_1_1446764187260_1593","colspan":"1","rowspan":"1","class":["yui3-datatable-header","yui3-datatable-col-Field"],"scope":"col","data-yui3-col-id":"Field"},"text":"Field"},{"tag":"th","attr":{"id":"yui_3_18_0_1_1446764187260_1594","colspan":"1","rowspan":"1","class":["yui3-datatable-header","yui3-datatable-col-Length"],"scope":"col","data-yui3-col-id":"Length"},"text":"Length"},{"tag":"th","attr":{"id":"yui_3_18_0_1_1446764187260_1595","colspan":"1","rowspan":"1","class":["yui3-datatable-header","yui3-datatable-col-Visibility"],"scope":"col","data-yui3-col-id":"Visibility","style":"text-align: center;"},"text":"Visibility"}]}]},{"tag":"tbody","attr":{"class":["yui3-datatable-message"],"id":"yui_3_18_0_1_1446764187260_1887"},"child":[{"tag":"tr","child":[{"tag":"td","attr":{"class":["yui3-datatable-message-content"],"colspan":"4"}}]}]},{"tag":"tbody","attr":{"class":["yui3-datatable-data"],"id":"yui_3_18_0_1_1446764187260_1877"},"child":[{"tag":"tr","attr":{"id":"yui_3_18_0_1_1446764187260_1851","data-yui3-record":"model_36","class":["yui3-datatable-even",""]},"child":[{"tag":"td","attr":{"class":["yui3-datatable-col-chkSelect","","yui3-datatable-cell","","center"]},"child":[{"tag":"input","attr":{"type":"checkbox","class":["yui3-datatable-checkbox-select"]}}]},{"tag":"td","attr":{"class":["yui3-datatable-col-Field","","yui3-datatable-cell",""]},"text":"chkSelect"},{"tag":"td","attr":{"class":["yui3-datatable-col-Length","","yui3-datatable-cell",""]},"text":"32"},{"tag":"td","attr":{"class":["yui3-datatable-col-Visibility","","yui3-datatable-cell",""],"style":"text-align: center;"},"child":[{"tag":"input","attr":{"type":"checkbox","value":"chkSelect","class":["settings-panel-chkSelect"],"checked":"checked"}}]}]},{"tag":"tr","attr":{"id":"yui_3_18_0_1_1446764187260_1852","data-yui3-record":"model_37","class":["yui3-datatable-odd",""]},"child":[{"tag":"td","attr":{"class":["yui3-datatable-col-chkSelect","","yui3-datatable-cell","","center"]},"child":[{"tag":"input","attr":{"type":"checkbox","class":["yui3-datatable-checkbox-select"]}}]},{"tag":"td","attr":{"class":["yui3-datatable-col-Field","","yui3-datatable-cell",""]},"text":"Name"},{"tag":"td","attr":{"class":["yui3-datatable-col-Length","","yui3-datatable-cell",""]},"text":"150"},{"tag":"td","attr":{"class":["yui3-datatable-col-Visibility","","yui3-datatable-cell",""],"style":"text-align: center;"},"child":[{"tag":"input","attr":{"type":"checkbox","value":"Name","class":["settings-panel-Name"],"checked":"checked"}}]}]},{"tag":"tr","attr":{"id":"yui_3_18_0_1_1446764187260_1853","data-yui3-record":"model_38","class":["yui3-datatable-even",""]},"child":[{"tag":"td","attr":{"class":["yui3-datatable-col-chkSelect","","yui3-datatable-cell","","center"]},"child":[{"tag":"input","attr":{"type":"checkbox","class":["yui3-datatable-checkbox-select"]}}]},{"tag":"td","attr":{"class":["yui3-datatable-col-Field","","yui3-datatable-cell",""]},"text":"Value"},{"tag":"td","attr":{"class":["yui3-datatable-col-Length","","yui3-datatable-cell",""]},"text":"150"},{"tag":"td","attr":{"class":["yui3-datatable-col-Visibility","","yui3-datatable-cell",""],"style":"text-align: center;"},"child":[{"tag":"input","attr":{"type":"checkbox","value":"Value","class":["settings-panel-Value"],"checked":"checked"}}]}]},{"tag":"tr","attr":{"id":"yui_3_18_0_1_1446764187260_1854","data-yui3-record":"model_39","class":["yui3-datatable-odd",""]},"child":[{"tag":"td","attr":{"class":["yui3-datatable-col-chkSelect","","yui3-datatable-cell","","center"]},"child":[{"tag":"input","attr":{"type":"checkbox","class":["yui3-datatable-checkbox-select"]}}]},{"tag":"td","attr":{"class":["yui3-datatable-col-Field","","yui3-datatable-cell",""]},"text":"Menu"},{"tag":"td","attr":{"class":["yui3-datatable-col-Length","","yui3-datatable-cell",""]},"text":"32"},{"tag":"td","attr":{"class":["yui3-datatable-col-Visibility","","yui3-datatable-cell",""],"style":"text-align: center;"},"child":[{"tag":"input","attr":{"type":"checkbox","value":"Menu","class":["settings-panel-Menu"],"checked":"checked"}}]}]}]}]}'.split('child').join('children');
//
//        //context.ApplicationClientTemplate.schema = JSON.stringify(that.removeProp(htmlJsonSchme, 'attr')).split('child').join('children');
//        context.ApplicationClientTemplate.schema = '[ { "tag":"div", "class":"form-group", "children":[ { "tag":"label", "html":"ID" }, { "tag":"input", "name":"eid", "id":"eid", "value": "${eid}", "class":"form-control" } ] }, { "tag":"div", "class":"form-group", "children":[ { "tag":"label", "html":"First Name" }, { "tag":"input", "name":"firstname", "value": "${firstname}", "class":"form-control" } ] }, { "tag":"div", "class":"form-group", "children":[ { "tag":"label", "html":"Last Name" }, { "tag":"input", "name":"lastname", "value": "${lastname}", "class":"form-control" } ] }, { "tag":"div", "class":"form-group", "children":[ { "tag":"label", "html":"Email" }, { "tag":"input", "name":"email", "value": "${email}", "class":"form-control" } ] }, { "tag":"div", "class":"form-group", "children":[ { "tag":"label", "html":"Organization" }, { "tag":"input", "name":"organization", "value": "${organization}", "class":"form-control" } ] }, { "tag":"div", "class":"form-group", "children":[ { "tag":"label", "html":"Password" }, { "tag":"input", "name":"password", "type":"password", "value": "${password}", "class":"form-control" } ] }, { "tag":"div", "class":"form-group", "children":[ { "tag":"label", "html":"FromTime" }, { "tag":"input", "id":"timepick", "name":"timepick1", "value": "${timepick1}", "class":"form-control time-picker" }, { "tag":"label", "html":"FromDate" }, { "tag":"input", "id":"datepick", "name":"datepick1", "value": "${datepick1}", "class":"form-control date-picker" } ] }, { "tag":"div", "class":"form-group", "children":[ { "tag":"label", "html":"ToTime" }, { "tag":"input", "id":"timepick", "name":"timepick2", "value": "${timepick2}", "class":"form-control time-picker" }, { "tag":"label", "html":"ToDate" }, { "tag":"input", "id":"datepick", "name":"datepick2", "value": "${datepick2}", "class":"form-control date-picker" } ] }, { "tag":"input", "value":"Save", "class":"btn btn-primary", "type":"submit" } ]';
//
//        that.setFormValue("CurrentContext", {
//            type: 'text',
//            value: context,
//            specialValue: true
//        });
//    });
//}

DynamoFourColumnFormPanel.prototype.removeProp = function (obj, propName) {

    for (var p in obj) {

        if (obj.hasOwnProperty(p)) {

            if (p == propName) {
                delete obj[p];

            } else if (typeof obj[p] == 'object') {
                this.removeProp(obj[p], propName);
            }
        }
    }
    return obj;
}


DynamoFourColumnFormPanel.prototype._addSettingsPanel = function () {
    var that = this;
    this.addChildPanel(
        'dynamofourcolumnsettingspanel',
        'settings',
        {
            panelTitle: "Table Settings",
            parentPanel: that,
            numCols: that.datatable.get('columns').length - 1
        },
        function (error, panel) {
            if (error) {
                console.log(error);
                return;
            }
            that.addRightMenuItem("Settings", function () {
                panel.showPanel();
                panel.bringToTop(that);
            });
        }
    );
};


DynamoFourColumnFormPanel.prototype.createModelList = function (tableData) {
    var modelList = new this.Y.ModelList();
    tableData.forEach(function (row) {
        var dataModel = new this.Y.Model();
        for (var col in row) {
            dataModel.set(col, row[col] + "");
            dataModel.set(col + "-fullValue", row[col + "-fullValue"]);
        }
        if (typeof row.id === "undefined") {
            dataModel.set('id', this.Y.Crypto.UUID());
        }
        modelList.add(dataModel);
    }, this);
    return modelList;
};

/**
 * Refreshes the datatableby calling the getTableData() function again
 * @param {Function} callback - Callback function
 */
DynamoFourColumnFormPanel.prototype.refreshDatatable = function (callback, loaded_data) {
    var that = this;
    this.getTableData(function (tableData) {
        that.datatable.set('data', tableData);
        $(".panel-title").html(that.getFormValue('DisplayName').value);
        if (typeof callback !== "undefined") {
            callback();
        }
    }, loaded_data);
};

DynamoFourColumnFormPanel.prototype.getUrlParameter = function (sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
