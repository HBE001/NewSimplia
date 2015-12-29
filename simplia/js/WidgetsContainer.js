// Define the WidgetsContainer constructor
var WidgetsContainer = function (properties) {
    $.extend(this, properties);

    // this hash contains all the buttons callback functions defined by the button UID
    this._buttonHandlers = {};

    // this canvas to measure the cell content string value in pixels,
    // as long as we are using pixels to define the column width,
    // we need t keep the string lenth under this predefined width.
    // trimCellData Function usign that canvas to to measure string,
    // then trim strings' values that showing on the cell to be just fit the column width
    this.longTextDialogBox;
    this.stringMeassringCanvas = document.createElement('canvas');
    this.stringMeassringCTX = this.stringMeassringCanvas.getContext("2d");
    this.stringMeassringCTX.font = "11px Arial";

    // Our Current available widgets till now and they were defined from the begining,
    // all the widget are CustomSubMenu class that follow simplia standered panel style
    // in addiition we can define the HTML inside that panel/menu, so we difne the HTML based on panel need
    // IMPORTANT HINT: All the widgets and 3rd Lib. that we may use to create or instantiate a widget
    // Should NOT use ID property in defining DIV and use Class instead.
    // to avoid conflicts if there are any existing widgets from previous Form that built before.
    this.timePickerWidget = "";
    this.stringValueWidget = "";
    this.listBoxWidget = "";
    this.radioButtonsWidget = "";
    this.telephoneNumberWidget = "";
    this.currencyWidget = "";
    this.jsonEditorWidget = "";
    this.htmlViewerWidget = "";

    // the column width which is defined in context schema
    this.columnWidth = this.parent.targetedContent.Style.ColumnsWidth;
    // To contain child panels
    this.childPanels = {};

    // that Array is responsible for getting the cell tag based on the supplied name, this tag array should be loaded dynamicly and user can extend it
    this.tagArray = {
        TableName: "tableName",
        Node: "textbox-id",
        Edge: "string",
        UpdateTime: "dateTime",
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
        OwnerID: 'textbox-id',
        OrganizationID: 'textbox-id',
        AccountID: 'textbox-id',
        OwnerDN: 'textbox-odn',
        OrganizationDN: 'textbox-odn',
        AccountDN: 'textbox-odn',
        Family: "string",
        Type: "string",
        RootTemplate: "string",
        Template: "string",
        Role: "string",
        Input: "string",
        Current_State: "string",
        Next_State: "string",
        Output: "string",
        Cycle: "string",
        Save_Button: "save_bfst_state",
        Select_Role: "bfst_listBox",
        Select_Current_State: "bfst_listBox",
        Select_Input: "listBox",
        Run_State: "run_bfst_state",
        Edit_Dynamo_Table_Name: "string",
        Save_Dynamo_Table_Name: "save_dynamo_table_name",
        Select_Widget: "widgets_listBox"
    };

    // Formatting Array that will contains the cell behavior in different cell value
    this.formattingArray = {
        'textbox': function (o) {
            var uid = 'btn_' + o.data.id;
            var trimedDataCell = that.trimCellData(o.column.key, o.value.value);
            return '<input type="text" id="txt_' + uid + '" value="' + trimedDataCell + '" style="font-size: small; outline: 0;"/>';
        },
        'textbox-map': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._createJSONEditor.bind(that, uid, o.data.Name.value, function (guid) {
                var trimedDataCell = that.trimCellData(o.column.key, guid);
                that.setFormValue(o.data.Name.value, {type: 'text', value: guid, trimedvalue: trimedDataCell});
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'textbox-id': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._getGUID.bind(that, uid, o.data.Name.value, function (guid) {
                var trimedDataCell = that.trimCellData(o.column.key, guid);
                that.setFormValue(o.data.Name.value, {type: 'text', value: guid, trimedvalue: trimedDataCell});
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'textbox-ost': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._generateOST.bind(that, uid, o.data.Name.value, function (ost) {
                var trimedDataCell = that.trimCellData(o.column.key, ost);
                that.setFormValue(o.data.Name.value, {type: 'text', value: ost, trimedvalue: trimedDataCell});
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'textbox-odn': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._getGDN.bind(that, uid, o.data.Name.value, function (gdn) {
                var trimedDataCell = that.trimCellData(o.column.key, gdn);
                that.setFormValue(o.data.Name.value, {type: 'text', value: gdn, trimedvalue: trimedDataCell});
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'textbox-oes': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayOESEditor.bind(that, uid, o.data.Name.value, function (oes) {
                var trimedDataCell = that.trimCellData(o.column.key, oes);
                that.setFormValue(o.data.Name.value, {type: 'text', value: oes, trimedvalue: trimedDataCell});
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'dateTime': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayTimePicker.bind(that, uid, o.data.Name.value, function (time) {
                var trimedDataCell = that.trimCellData(o.column.key, time);
                that.setFormValue(o.data.Name.value, {type: 'text', value: time, trimedvalue: trimedDataCell});
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'string': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayStringValuePicker.bind(that, uid, o.data.Name.value, function (string) {
                var trimedDataCell = that.trimCellData(o.column.key, string);
                that.setFormValue(o.data.Name.value, {type: 'text', value: string, trimedvalue: trimedDataCell});
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'tableName': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayStringValuePicker.bind(that, uid, o.data.Name.value, function (string) {
                that.tableName = string;
                that.refreshDatatable();
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'password': function (o) {
            var trimedDataCell = that.trimCellData(o.column.key, o.value.value);
            return '<input type="password" value="' + trimedDataCell + '"/>';
        },
        'readonly': function (o) {
            var trimedDataCell = that.trimCellData(o.column.key, o.value.value);
            return '<input type="text" readonly value="' + trimedDataCell + '" style="font-size: small;"/>';
        },
        'list': function (o) {
            var html = '<select>';
            for (var i in o.value.value) {
                var trimedDataCell = that.trimCellData(o.column.key, o.value.value[i]);
                html += '<option value="' + i + '">' + trimedDataCell + '</option>';
            }
            return html + '</select>';
        },
        'listBox': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayListBoxPicker.bind(that, o.value.value, uid, o.data.Name.value, function (value) {
                var trimedDataCell = that.trimCellData(o.column.key, value);
                that.setFormValue(o.data.Name.value, {type: 'text', value: value, trimedvalue: trimedDataCell});
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'widgets_listBox': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayWidgetsListBoxPicker.bind(that, o.value.value, uid, o.data.Name.value, function (value) {
                if (that.parent.referenceComponent.extendedTagArray == undefined) {
                    that.parent.referenceComponent.extendedTagArray = {};
                }
                that.parent.referenceComponent.extendedTagArray[o.data.Name.value] = value;
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'bfst_listBox': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayListBoxPicker.bind(that, o.value.value, uid, o.data.Name.value, function (time) {
                var trimedDataCell = that.trimCellData(o.column.key, time);
                that.setFormValue(o.data.Name.value, {type: 'text', value: time, trimedvalue: trimedDataCell});
                // this is special handling for the BFST Select Box to update input list pased on selected role and state
                var jsonValue = that.collectFormData("Save_Button");
                var tipValuesArrays = that.getTipValuesArrays(jsonValue['Select_Current_State'], jsonValue['Select_Role']);
                that.setFormMenuAction("Select_Input", that.tagArray["Select_Input"], tipValuesArrays.inputArray);
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'radioButtons': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayRadioButtonPicker.bind(that, o.value.value, uid, o.data.Name.value, function (time) {
                var trimedDataCell = that.trimCellData(o.column.key, time);
                that.setFormValue(o.data.Name.value, {type: 'text', value: time, trimedvalue: trimedDataCell});
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'telephone': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayTelephoneNumberPicker.bind(that, uid, o.data.Name.value, function (time) {
                var trimedDataCell = that.trimCellData(o.column.key, time);
                that.setFormValue(o.data.Name.value, {type: 'text', value: time, trimedvalue: trimedDataCell});
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'currency': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayCurrencyPicker.bind(that, uid, o.data.Name.value, function (time) {
                var trimedDataCell = that.trimCellData(o.column.key, time);
                that.setFormValue(o.data.Name.value, {type: 'text', value: time, trimedvalue: trimedDataCell});
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'json': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayJSONEditor.bind(that, uid, o.data.Name.value, function (time) {
                var trimedDataCell = that.trimCellData(o.column.key, time);
                that.setFormValue(o.data.Name.value, {
                    type: 'text',
                    value: time,
                    trimedvalue: trimedDataCell,
                    specialValue: true
                });
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'json-context': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayContextEditor.bind(that, uid, o.data.Name.value, function (json) {
                var FinalContextExist = (
                    that.getFormValue('FinalContext').value != undefined &&
                    that.getFormValue('FinalContext').value != "" &&
                    that.getFormValue('FinalContext').value != {} &&
                    that.getFormValue('FinalContext').value != {"": ""} ? true : false);

                if (!FinalContextExist) {
                    if (o.data.Name.value == "CurrentContext") {
                        that.setFormValue(o.data.Name.value, {
                            type: 'text',
                            value: json,
                            specialValue: true
                        });
                    } else {
                        alert("Error: Can not edit on that context");
                    }
                } else {
                    alert("Error: It's Final " + that.getFormValue('MetaType').value);
                }
            }, function (formData) {
                var FinalContextExist = (
                    that.getFormValue('FinalContext').value != undefined &&
                    that.getFormValue('FinalContext').value != "" &&
                    that.getFormValue('FinalContext').value != {} &&
                    that.getFormValue('FinalContext').value != {"": ""} ? true : false);

                if (!FinalContextExist) {
                    if (o.data.Name.value == "CurrentContext") {
                        var originalValues = that.getFormValue(o.data.Name.value).value;
                        if (originalValues.ApplicationClientData == undefined) {
                            originalValues.ApplicationClientData = {};
                        }
                        originalValues.ApplicationClientData.data = JSON.stringify(formData);

                        console.log("Setting Form Value = ", o.data.Name.value);

                        that.setFormValue(o.data.Name.value, {
                            type: 'text',
                            value: originalValues,
                            specialValue: true
                        });
                    } else {
                        alert("Error: Can not edit on that context");
                    }
                } else {
                    alert("Error: It's Final " + that.getFormValue('MetaType').value);
                }
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'button': function (o) {
            var uid = 'btn_' + o.data.id;
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'text': function (o) {
            var uid = 'btn_' + o.data.id;
            if (o.value.value != undefined && o.value.value != "" && o.value.specialValue != undefined && o.value.specialValue != "") {
                return '<div type="text" id="txt_' + uid + '">' +
                    '<span style="color: #0072C5 !important; font-weight: bold!important;"">' + (o.value.value == "" ? '' : '&nbsp;&nbsp;...') + '</span> </div>';
            }
            var trimedDataCell = that.trimCellData(o.column.key, o.value.value);
            if (trimedDataCell != o.value.value) {
                return '<div type="text" id="txt_' + uid + '">' + trimedDataCell +
                    '<span style="color: #0072C5 !important; font-weight: bold!important;"">&nbsp;&nbsp;...</span> </div>';
            }
            return '<div type="text" id="txt_' + uid + '">' + trimedDataCell + '</div>';
        },
        'text-field': function (o) {
            var uid = 'btn_' + o.data.id;
            var trimedDataCell = that.trimCellData(o.column.key, o.value.value);
            return '<div type="text" id="txt_field_' + uid + '" style="color: #0072C5 !important; font-weight: bold!important;">' + trimedDataCell + '</div>';
        },
        'textarea': function (o) {
            var trimedDataCell = that.trimCellData(o.column.key, o.value.value);
            return '<textarea cols="50" rows="10">' + trimedDataCell + '</textarea>';
        },
        'save_bfst_state': function (o) {
            var uid = "btn_" + o.data.id;
            that._buttonHandlers[uid] = that._applySaveState.bind(that, uid, o.data.Name.value);
            that.setFormValue(o.data.Name.value, {
                type: 'text',
                value: o.data.Name.value,
                specialValue: true
            });
            return "<button type='button' class='datatable-button' style='border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;' data-uid='" + uid + "'>&#9776;</button>";
        },
        'run_bfst_state': function (o) {
            var uid = "btn_" + o.data.id;
            that._buttonHandlers[uid] = that._runSelectedStateInput.bind(that, uid, o.data.Name.value);
            that.setFormValue(o.data.Name.value, {
                type: 'text',
                value: o.data.Name.value,
                specialValue: true
            });
            return "<button type='button' class='datatable-button' style='border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;' data-uid='" + uid + "'>&#9776;</button>";
        },
        'save_dynamo_table_name': function (o) {
            var uid = "btn_" + o.data.id;
            that._buttonHandlers[uid] = that._applySaveDynamoTableName.bind(that, uid, o.data.Name.value);
            that.setFormValue(o.data.Name.value, {
                type: 'text',
                value: o.data.Name.value,
                specialValue: true
            });
            return "<button type='button' class='datatable-button' style='border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;' data-uid='" + uid + "'>&#9776;</button>";
        },
        'default': function (o) {
            var trimedDataCell = that.trimCellData(o.column.key, o.value.value);
            return '<input type="text" value="' + trimedDataCell + '" style="font-size: small;"/>';
        }
    };


    // First we load the 3rd party libs and then construct the widget.
    // Widget get constructed on two steps, 1- building the HTML view, 2- set the HTML content based on supplied data
    var that = this;
    $.getScript("./js/menus/customesubmenu.js", function () {
        $.getScript("./js/jquery.timepicker.js", function () {
            that.constructTimePicker();
        });
        that.constructStringValueWidget();
        $.getScript("./js/jquery.searchit.js", function () {
            that.constructListBoxWidget();
        });

        that.constructRadioButtonsWidget();

        $.getScript("./js/PhoneNumberNormalizer.js");
        that.constructTelephoneNumberWidget();

        $.getScript("./js/bootstrap-formhelpers-currencies.js", function () {
            that.constructCurrencyWidget();
        });

        that.constructJSONEditorWidget();
        that.constructHTMLViewerWidget();
    });

    this.rowActionMenu = new RightMenu(this.Y, {parentPanel: this, customMenu: true});
};

/**
 * Adds a panel instance of the specified class as a child of the current panel. Child panel works like any normal panel, except that its life and display is linked with the parent panel
 * @param {string} panelName - Valid Panel type name
 * @param {string} name - Identifier for the panel; to be used in calls to childPanel() function
 * @param {Object} properties - Object containing panel attributes
 * @param {Function} callback - Callback to be executed after the panel has been created and initialized
 */
WidgetsContainer.prototype.addChildPanel = function (panelName, name, properties, callback) {
    var panelCache = this.Y.screenManager.pLoader.getCache(panelName);
    if (typeof panelCache === "undefined") {
        return callback({error: 1, errorInfo: "unknown panel classname"});
    }
    var className = panelCache.config.name;

    var that = this;

    if (typeof panelCache['html'] !== "undefined") {
        properties.bodyContent = panelCache.html;
    }

    this.childPanels[name] = new window[className](this.Y, properties);


    this.childPanels[name].init(function () {
        that.childPanels[name].panel.on('visibleChange', function (e) {
            //Only change the position if the panel is being displayed
            if (e.newVal) {
                this.panel.align('#' + this.parentPanel.panel.get('boundingBox').get('id') + ' .yui3-widget-bd',
                    [this.Y.WidgetPositionAlign.TR, this.Y.WidgetPositionAlign.TR])
            }
        }, that.childPanels[name]);
        callback(null, that.childPanels[name]);
    });
};


/*----------------------------------------------------------*/
/**
 * Displays a select role dialog with customizable title, text
 * @param {string} title - Dialog Title
 * @param {string} text - Text for the body of the dialog
 */
WidgetsContainer.prototype._showLongMessageDialogBox = function (title, text) {
    $('#' + this.longTextDialogBox.get('id') + ' .header-title').html(title);
    $('#' + this.longTextDialogBox.get('id') + ' .simple-dialog-message').html(text);
    $('#' + this.longTextDialogBox.get('boundingBox').get('id') + ' .yui3-widget-ft').css('text-align', 'center');
    this.longTextDialogBox.align('#' + this.parent.panel.get('boundingBox').get('id') + ' .yui3-widget-bd', [this.Y.WidgetPositionAlign.TC, this.Y.WidgetPositionAlign.TC]);
    this.longTextDialogBox.set("zIndex", this.parent.panel.get("zIndex") + 1);
    this.longTextDialogBox.show();
};

// Building first example of String Editor Widget
// 1- We crete the html container div with the needed style, and button inside the widget,
// 2- Add the created HTMl inside custom Sub menu view and provide the targeted dependinces
// 3- When user call setStringValueListner method, it actually provied the Manu with the html inside it
// and any other dependiny data that panel may require
/*----------------------------------------------------------*/
WidgetsContainer.prototype.constructStringValueWidget = function () {
    var that = this;

    jQuery(document.createElement("div")).attr("class", "stringValueTemplate").css('display', 'none').
        html('<textarea class="stringValueTextArea" rows="2" cols="50"></textarea><br/>' +
        '<button class= "setStringButton btn btn-primary btn-block" type="button" style="text-align: center">Done</button>').appendTo("body");

    if (this.stringValueWidget == "") {
        that.stringValueWidget = new CustomeSubMenu(this.Y, {
            subMenuTitle: "Set String",
            parentPanel: that,
            parentMenu: that.rightMenu,
            isParentSubMenu: false,
            HTMLBody: $('.stringValueTemplate').html()
        });
        that.stringValueWidget.menu.set('headerContent', '<div class="header-title">Set String</div>');
        that.stringValueWidget.menu.set("zIndex", this.parent.panel.get("zIndex") + 1);
    }
}

WidgetsContainer.prototype.setStringValueListner = function (button_id, value, callback) {
    var that = this;
    $('.stringValueTextArea').val(value);
    $('.setStringButton').off('click');
    $('.setStringButton').click(function () {
        callback($('.stringValueTextArea').val());
        that.stringValueWidget.deactivate();
        $('.setStringButton').off('click');
    });
    if (button_id != "") {
        $('#' + that.stringValueWidget.menu.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
        $('#' + that.stringValueWidget.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
    }
};


/*----------------------------------------------------------*/
WidgetsContainer.prototype.constructListBoxWidget = function () {
    var that = this;

    $(".__searchitWrapper0").remove();
    jQuery(document.createElement("div")).attr("class", "listBoxTemplate").css('display', 'none').
        html('<select class="listBoxSelection" style="height = 28px; font-size=medium;"></select>' +
        '<button class= "listBoxButton btn btn-primary btn-block" type="button" style="text-align: center">Done</button>').appendTo("body");

    if (this.listBoxWidget == "") {
        that.listBoxWidget = new CustomeSubMenu(this.Y, {
            subMenuTitle: "Set String",
            parentPanel: that,
            parentMenu: that.rightMenu,
            isParentSubMenu: false,
            HTMLBody: $('.listBoxTemplate').html()
        });
        that.listBoxWidget.menu.set('headerContent', '<div class="header-title">Select Value</div>');
        that.listBoxWidget.menu.set("zIndex", this.parent.panel.get("zIndex") + 1);
    }
}

WidgetsContainer.prototype.setListBoxListner = function (listValues, value, button_id, callback) {
    var that = this;

    html = "";
    for (var key in listValues) {
        html += "<option value=" + key + ">" + listValues[key] + "</option>"
    }
    $(".listBoxSelection").html(html);

    $(".listBoxSelection").searchit({
        textFields: $('.__searchit0'),
        textFieldClass: null, // Textbox class
        dropDownClass: null,    // Dropdown class
        size: 4,                 // Elements to show when typing
        dropDown: true,
        noElementText: "No elements found"  // "No elements found" text
    });

    $('.__searchit0').val(value);
    $('.listBoxButton').off('click');
    $('.listBoxButton').click(function () {
        callback($('.listBoxSelection').val());
        that.listBoxWidget.deactivate();
        $('.listBoxButton').off('click');
    });


    $('#' + that.listBoxWidget.menu.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + that.listBoxWidget.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
};

/*----------------------------------------------------------*/
WidgetsContainer.prototype.constructRadioButtonsWidget = function () {
    var that = this;

    jQuery(document.createElement("div")).attr("class", "radioButtonsTemplate").css('display', 'none').
        html('<form class="radioButtonsSelection" style=" font-size: 80%; "></form>' +
        '<button class= "radioButtonsSelectionButton btn btn-primary btn-block" type="button" style="text-align: center">Done</button>').appendTo("body");

    if (this.radioButtonsWidget == "") {
        that.radioButtonsWidget = new CustomeSubMenu(this.Y, {
            subMenuTitle: "Set String",
            parentPanel: that,
            parentMenu: that.rightMenu,
            isParentSubMenu: false,
            HTMLBody: $('.radioButtonsTemplate').html()
        });
        that.radioButtonsWidget.menu.set('headerContent', '<div class="header-title">Select Value</div>');
        that.radioButtonsWidget.menu.set("zIndex", this.parent.panel.get("zIndex") + 1);
    }
}

WidgetsContainer.prototype.setRadioButtonsListner = function (listValues, button_id, callback) {
    var that = this;

    html = "";
    for (var key in listValues) {
        html += "<input type='radio' name='radioSelection' value=" + key + ">" + listValues[key] + "<br>"
    }
    $(".radioButtonsSelection").html(html);

    $('.radioButtonsSelectionButton').off('click');
    $('.radioButtonsSelectionButton').click(function () {
        callback($("input[type='radio'][name='radioSelection']:checked").val());
        that.radioButtonsWidget.deactivate();
        $('.radioButtonsSelectionButton').off('click');
    });

    $('#' + that.radioButtonsWidget.menu.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + that.radioButtonsWidget.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
    //$('#' + that.radioButtonsWidget.menu.get('boundingBox').get('id') + " .yui3-widget-hd").css({padding: '1px 1px 1px 1px'});
};

/*----------------------------------------------------------*/
WidgetsContainer.prototype.constructTelephoneNumberWidget = function () {
    jQuery(document.createElement("div")).attr("class", "telephoneNumberTemplate").css('display', 'none').
        //html('Phone: (<input type="text" name="phone-1" maxlength="3" type="tel" style="width: 30px;">) <input type="text" name="phone-2" maxlength="3" type="tel" style="width: 30px;">- <input type="text" name="phone-3" maxlength="4" type="tel" style="width: 30px;"><br/>' +
        html('<input type="text" name="phoneNumber" type="tel" style="width: 99%;">' +
        '<br/><button class= "telephoneNumberButton btn btn-primary btn-block" type="button" style="text-align: center">Done</button>').appendTo("body");


    var that = this;
    if (this.telephoneNumberWidget == "") {
        that.telephoneNumberWidget = new CustomeSubMenu(this.Y, {
            subMenuTitle: "Set String",
            parentPanel: that,
            parentMenu: that.rightMenu,
            isParentSubMenu: false,
            HTMLBody: $('.telephoneNumberTemplate').html()
        });
        that.telephoneNumberWidget.menu.set('headerContent', '<div class="header-title">Enter Phone Number</div>');
        that.telephoneNumberWidget.menu.set("zIndex", this.parent.panel.get("zIndex") + 1);
    }
}

WidgetsContainer.prototype.setTelephoneNumberListner = function (button_id, callback) {
    var that = this;

    $('.telephoneNumberButton').off('click');
    $('.telephoneNumberButton').click(function () {
        callback(PhoneNumberNormalizer.Normalize($('[name="phoneNumber"]').val()));
        that.telephoneNumberWidget.deactivate();
        $('.telephoneNumberButton').off('click');
    });

    $('#' + that.telephoneNumberWidget.menu.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + that.telephoneNumberWidget.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
    //$('#' + that.telephoneNumberWidget.menu.get('boundingBox').get('id') + " .yui3-widget-hd").css({padding: '1px 1px 1px 1px'});
};

/*----------------------------------------------------------*/
WidgetsContainer.prototype.constructCurrencyWidget = function () {
    var that = this;

    jQuery(document.createElement("div")).attr("class", "currencyTemplate").css('display', 'none').
        html('Currency:<br/> <input type="text" name="currencyValue">' +
        '<br/><button class= "currencyButton btn btn-primary btn-block" type="button" style="text-align: center">Done</button>').appendTo("body");

    if (this.currencyWidget == "") {
        that.currencyWidget = new CustomeSubMenu(this.Y, {
            subMenuTitle: "Set String",
            parentPanel: that,
            parentMenu: that.rightMenu,
            isParentSubMenu: false,
            HTMLBody: $('.currencyTemplate').html()
        });
        that.currencyWidget.menu.set('headerContent', '<div class="header-title">Enter Currency</div>');
        that.currencyWidget.menu.set("zIndex", this.parent.panel.get("zIndex") + 1);
    }
}

WidgetsContainer.prototype.setCurrencyListner = function (button_id, callback) {
    var that = this;

    $('.currencyButton').off('click');
    $('.currencyButton').click(function () {
        callback(parseFloat($('[name="currencyValue"]').val()));
        that.currencyWidget.deactivate();
        $('.currencyButton').off('click');
    });

    $('#' + that.currencyWidget.menu.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + that.currencyWidget.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
};

/*----------------------------------------------------------*/
WidgetsContainer.prototype.constructJSONEditorWidget = function () {
    var that = this;
    //this.addChildPanel('jsoneditorpanel', 'jsoneditorpanel', {
    //    panelTitle: "JSON Editor",
    //    parentPanel: this
    //}, function (error, panel) {
    //    if (error) {
    //        console.log(error);
    //        return;
    //    }
    //    that.jsonEditorWidget = panel;
    //});
};

WidgetsContainer.prototype.setJSONEditorListner = function (button_id, existingJSON, callback) {
    var that = this;
    var parsedJSON = (existingJSON != undefined && existingJSON != "" ? existingJSON : {});

    this.jsonEditorWidget.parentCallBack = callback;
    this.jsonEditorWidget.editor.set(parsedJSON);
    //this.jsonEditorWidget.editor2.set(parsedJSON);

    this.jsonEditorWidget.showPanel();
    this.jsonEditorWidget.bringToTop(that);

    $('#' + that.jsonEditorWidget.panel.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + that.jsonEditorWidget.panel.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
};

/*----------------------------------------------------------*/
WidgetsContainer.prototype.constructHTMLViewerWidget = function () {
    var that = this;
    console.log("Constructing HTML Viewer");
    this.addChildPanel('oxygencomponentsviewpanel', 'oxygencomponentsviewpanel', {
        panelTitle: "HTML Viewer",
        parentPanel: this,
        custom: true
    }, function (error, panel) {
        if (error) {
            console.log("HTML Viewer error:");
            console.log(error);
            return;
        }
        console.log("HTML Viewer panel:");
        console.log(panel);
        that.htmlViewerWidget = panel;
    });
};

WidgetsContainer.prototype.setHTMLViewerListner = function (button_id, formData, callback) {
    this.htmlViewerWidget.viewAsHTML(formData);

    this.htmlViewerWidget.parentCallBack = callback;
    this.htmlViewerWidget.showPanel();
    this.htmlViewerWidget.bringToTop(this);

    $('#' + this.htmlViewerWidget.panel.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + this.htmlViewerWidget.panel.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
};


/*----------------------------------------------------------*/
WidgetsContainer.prototype.constructTimePicker = function () {
    var that = this;

    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "./css/jquery.timepicker.css"
    }).appendTo("head");

    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "./css/pickaday.css"
    }).appendTo("head");

    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "./css/bootstrap-datepicker.css"
    }).appendTo("head");

    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "./css/customButton.css"
    }).appendTo("head");

    $.getScript("./js/datepair.js");
    $.getScript("./js/jquery.datepair.js");
    $.getScript("./js/bootstrap-datepicker.js");

    var timezoneOffsitePicker = '<select class="timezoneOffsite" name="timezone"> <option value="-12" >(GMT -12:00) Eniwetok, Kwajalein</option> <option value="-11" >(GMT -11:00) Midway Island, Samoa</option> <option value="-10" >(GMT -10:00) Hawaii</option> <option value="-9" >(GMT -9:00) Alaska</option> <option value="-8" >(GMT -8:00) Pacific Time (US &amp; Canada)</option> <option value="-7" >(GMT -7:00) Mountain Time (US &amp; Canada)</option> <option value="-6" >(GMT -6:00) Central Time (US &amp; Canada), Mexico City</option> <option value="-5" >(GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima</option> <option value="-4.5">(GMT -4:30) Caracas</option> <option value="-4" >(GMT -4:00) Atlantic Time (Canada), La Paz, Santiago</option> <option value="-3.5">(GMT -3:30) Newfoundland</option> <option value="-3" >(GMT -3:00) Brazil, Buenos Aires, Georgetown</option> <option value="-2" >(GMT -2:00) Mid-Atlantic</option> <option value="-1" >(GMT -1:00 hour) Azores, Cape Verde Islands</option> <option value="0" selected="selected">(GMT) Western Europe Time, London, Lisbon, Casablanca, Greenwich</option> <option value="1" >(GMT +1:00 hour) Brussels, Copenhagen, Madrid, Paris</option> <option value="2" >(GMT +2:00) Kaliningrad, South Africa, Cairo</option> <option value="3" >(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg</option> <option value="3.5" >(GMT +3:30) Tehran</option> <option value="4" >(GMT +4:00) Abu Dhabi, Muscat, Yerevan, Baku, Tbilisi</option> <option value="4.5" >(GMT +4:30) Kabul</option> <option value="5" >(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent</option> <option value="5.5" >(GMT +5:30) Mumbai, Kolkata, Chennai, New Delhi</option> <option value="5.75">(GMT +5:45) Kathmandu</option> <option value="6" >(GMT +6:00) Almaty, Dhaka, Colombo</option> <option value="6.5" >(GMT +6:30) Yangon, Cocos Islands</option> <option value="7" >(GMT +7:00) Bangkok, Hanoi, Jakarta</option> <option value="8" >(GMT +8:00) Beijing, Perth, Singapore, Hong Kong</option> <option value="9" >(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk</option> <option value="9.5" >(GMT +9:30) Adelaide, Darwin</option> <option value="10" >(GMT +10:00) Eastern Australia, Guam, Vladivostok</option> <option value="11" >(GMT +11:00) Magadan, Solomon Islands, New Caledonia</option> <option value="12" >(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka</option> </select>';

    jQuery(document.createElement("div")).attr("class", "timePicker").css('display', 'none').
        html('<p class="datepairExample" style="margin: 0;">' +
        'Date:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
        'Time:<br/> ' +
        '<input type="text" class="date start"/><input type="text" class="time start" />' +
            //timezoneOffsitePicker + '<br/>' +
        '<br/><button class= "startButton btn btn-primary btn-block" type="button" style="text-align: center">Done</button></p>').appendTo("body");

    if (this.timePickerWidget == "") {
        // ------------------------------------------------------------
        that.timePickerWidget = new CustomeSubMenu(this.Y, {
            subMenuTitle: "Select TimePicker",
            parentPanel: that,
            parentMenu: that.rightMenu,
            isParentSubMenu: false,
            HTMLBody: $('.timePicker').html()
        });
        that.timePickerWidget.menu.set('headerContent', '<div class="header-title">Select Time</div>');
        that.timePickerWidget.menu.set("zIndex", this.parent.panel.get("zIndex") + 1);
    }
};

WidgetsContainer.prototype.setTimePickerListner = function (button_id, callback) {
    var that = this;

    $('.datepairExample .time').timepicker({
        'showDuration': true,
        'timeFormat': 'g:ia'
    });

    $('.datepairExample .date').datepicker({
        'format': 'yyyy-m-d',
        'autoclose': true
    });

    // initialize datepair
    $('.datepairExample').datepair();

    $('.startButton').off('click');
    $('.startButton').click(function () {
        console.log("Start clicked");
        var startingTime = new Datepair($('.datepairExample')[0]).getStartTime();
        //var timeOffsite = $('.timezoneOffsite').val() * 60 * 60;
        callback(startingTime);
        that.timePickerWidget.deactivate()
        $('.startButton').off('click');
    });


    $('#' + that.timePickerWidget.menu.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + that.timePickerWidget.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
};


/**
 *
 * @param {Object} o
 * @returns {*}
 * @private
 */
WidgetsContainer.prototype._formFormatter = function (o) {
    var that = this;
    var retVal = '';
    if (typeof o.value === "undefined" || !o.value) {
        o.value = {};
    }
    if (typeof o.value.type === "undefined" || !o.value.type) {
        o.value.type = "default";
    } else if (o.column.key != "Value" && o.data.Value.type == "button") {
        return "";
    }
    return this.formattingArray[o.value.type](o);
};

// implementing callback function from the formatter
WidgetsContainer.prototype._getGUID = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("NEW UID", function () {
        that.doAjaxJSONCall(that.guidUrl, "", function (data) {
            if (typeof data.error !== "undefined") {
                return console.log('Error:', data.error);
            }
            if (typeof callback !== "undefined") {
                callback(data.guid)
            }
        }, "GET");
    }, true);
    if (button_uid != undefined) {
        this.resetRowMenuItems(button_uid, title);
        this.rowActionMenu.menu.show();
    }
}

WidgetsContainer.prototype._getGDN = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("NEW DN", function () {
        that.stringValueWidget.callbackFunction = (function () {
            that.setStringValueListner(button_uid, that.getFormValue(title).value, function (prefix) {
                var formValue = that.getFormValue('Node');
                params = {
                    guid: formValue.value,
                    prefix: prefix,
                    type: 'Simple'
                };

                that.doAjaxJSONCall(that.gdnUrl, $.param(params), function (data) {
                    if (typeof data.error !== "undefined") {
                        return console.log('Error:', data.error);
                    }
                    if (typeof callback !== "undefined") {
                        callback(data.gdn)
                    }
                }, "GET");
            });
        });
        that.stringValueWidget.activate();
    }, true);
    this.addRowMenuItem("Enter DN", function () {
        that.stringValueWidget.callbackFunction = (function () {
            that.setStringValueListner(button_uid, that.getFormValue(title).value, callback);
        });
        that.stringValueWidget.activate();
    }, true);

    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

WidgetsContainer.prototype._createJSONEditor = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("Open JSONEditor", function () {
        that.addChildPanel('jsoneditorpanel', 'JSON Editor', {
            panelTitle: "JSON Editor",
            parentPanel: that,
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
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}


WidgetsContainer.prototype._generateOST = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("JSONEditor", function () {
        var time = (new Date()).toISOString();
        callback(time);
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

WidgetsContainer.prototype._displayOESEditor = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("OESEditor", function () {
        that.addChildPanel('jsoneditorpanel', 'JSON Editor', {
            panelTitle: "JSON Editor",
            parentPanel: that,
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
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

WidgetsContainer.prototype._displayCurrencyPicker = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("Set Currency", function () {
        that.currencyWidget.callbackFunction = (function () {
            that.setCurrencyListner(button_uid, callback);
        });
        that.currencyWidget.activate();
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

WidgetsContainer.prototype._displayJSONEditor = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("JSON Editor", function () {
        that.setJSONEditorListner(button_uid, that.getFormValue(title).value, callback);
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

WidgetsContainer.prototype._displayContextEditor = function (button_uid, title, JSONEditor_callback, HTMLViewer_callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("JSON Editor", function () {
        that.setJSONEditorListner(button_uid, that.getFormValue(title).value, JSONEditor_callback);
    }, true);

    this.addRowMenuItem("View HTML", function () {
        that.addChildPanel('contextviewerpanel', 'contextviewerpanel', {
            panelTitle: title,
            parentPanel: that,
            targetedContent: JSON.parse(JSON.stringify(that.getFormValue(title).value)) /* to pass by value not by reference value */,
            fullComponent: JSON.parse(JSON.stringify(that.collectFormData(["tableName"]))) /* to pass by value not by reference value */,
            jsonValue: $('#txt_' + button_uid).val()
        }, function (error, panel) {
            if (error) {
                console.log(error);
            } else {
                panel.showPanel();
                panel.bringToTop(that);
            }
        });
        //eval(that.getFormValue("Code").value.htmlviewer);
        //window.open("http://52.23.228.139:3005/?gdn=" + that.getFormValue("DisplayName").value , "_blank");
        //that.setHTMLViewerListner(button_uid, that.getFormValue(title).value, HTMLViewer_callback);
    }, true);

    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

WidgetsContainer.prototype._displayTelephoneNumberPicker = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("Enter Telephone Number", function () {
        that.telephoneNumberWidget.callbackFunction = (function () {
            that.setTelephoneNumberListner(button_id, callback);
        });
        that.telephoneNumberWidget.activate();
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

WidgetsContainer.prototype._displayListBoxPicker = function (listvalues, button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("Open Listbox", function () {
        console.log("Button ID = ", button_uid);
        //listvalues = {
        //    Name1: "Name1",
        //    Name2: "Name2",
        //    Name3: "Name3",
        //    Age1: "Age1",
        //    Age2: "Age2",
        //    Gender: "Gender"
        //};
        that.listBoxWidget.callbackFunction = (function () {
            that.setListBoxListner(listvalues, that.getFormValue(title).value, button_uid, callback);
        });
        that.listBoxWidget.activate();
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

WidgetsContainer.prototype._displayWidgetsListBoxPicker = function (listvalues, button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("Select Widget", function () {
        console.log("Button ID = ", button_uid);

        listvalues = {
            "textbox-id": "Generate GUID",
            "textbox-odn": "Generate GDN",
            "string": "String Editor",
            "dateTime": "Time Picker",
            "radioButtons": "Radio Picker",
            "listBox": "ListBox Picker",
            "telephone": "Telephone Editor",
            "currency": "Currency Editor",
            "json": "JSON Editor",
            "json-context": "Context (JSON Editor and HTML Viewer)",
            "button": "No Thing"
        };
        that.listBoxWidget.callbackFunction = (function () {
            that.setListBoxListner(listvalues, that.getFormValue(title).value, button_uid, callback);
        });
        that.listBoxWidget.activate();
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

WidgetsContainer.prototype._displayRadioButtonPicker = function (listvalues, button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("Select Option", function () {
        console.log("Button ID = ", button_uid);
        listValues = {
            "Name": "Name",
            "Age": "Age",
            "Gender": "Gender"
        };
        that.radioButtonsWidget.callbackFunction = (function () {
            console.log("DataPicker callback function");
            that.setRadioButtonsListner(listValues, button_uid, callback);
        });
        that.radioButtonsWidget.activate();
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}


WidgetsContainer.prototype._displayStringValuePicker = function (button_uid, title, callback) {
    var that = this;
    console.log("Display String Value Picker");
    console.log(that);
    console.log("--------------------------------------");

    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("String Editor", function () {
        console.log("Button ID = ", button_uid);
        that.stringValueWidget.callbackFunction = (function () {
            console.log("DataPicker callback function");
            that.setStringValueListner(button_uid, that.getFormValue(title).value, callback);
        });
        that.stringValueWidget.activate();
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

WidgetsContainer.prototype._displayTimePicker = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("Time Picker", function () {
        console.log("Button ID = ", button_uid);
        that.timePickerWidget.callbackFunction = (function () {
            console.log("DataPicker callback function");
            that.setTimePickerListner(button_uid, callback);
        });
        that.timePickerWidget.activate();
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
};

WidgetsContainer.prototype._applySaveState = function (button_uid, title) {
    console.log("Apply Save State");
    var that = this;

    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("Save State", function () {
        var jsonValue = that.collectFormData("Save_Button");
        console.log("Save_BFST_State Button");
        console.log(jsonValue);
        var stateInput_stateJSON, stateInput_inputJSON, roleState_roleJSON, roleState_stateJSON;

        if (that.parent.targetedContent.stateInputJSON.StateInput === undefined) {
            stateInput_stateJSON = {};
            stateInput_inputJSON = {};
        } else {
            stateInput_stateJSON = that.parent.targetedContent.stateInputJSON.StateInput;
            if (stateInput_stateJSON[jsonValue.Current_State] === undefined) {
                stateInput_inputJSON = {};
            } else {
                stateInput_inputJSON = stateInput_stateJSON[jsonValue.Current_State];
            }
        }
        stateInput_inputJSON[jsonValue.Input] = {
            Output: jsonValue.Output,
            Next_State: jsonValue.Next_State,
            Cycle: jsonValue.Cycle
        };
        stateInput_stateJSON[jsonValue.Current_State] = stateInput_inputJSON;
        that.parent.targetedContent.stateInputJSON = {StateInput: stateInput_stateJSON};
        if (that.parent.targetedContent.roleStateJSON.RoleState === undefined) {
            roleState_roleJSON = {};
            roleState_stateJSON = {};
            roleState_stateJSON[jsonValue.Current_State] = [];
        } else {
            roleState_roleJSON = that.parent.targetedContent.roleStateJSON.RoleState;
            if (roleState_roleJSON[jsonValue.Role] === undefined) {
                roleState_stateJSON = {};
            } else {
                roleState_stateJSON = roleState_roleJSON[jsonValue.Role];
            }
            if (roleState_stateJSON[jsonValue.Current_State] === undefined) {
                roleState_stateJSON[jsonValue.Current_State] = [];
            }
        }
        if (roleState_stateJSON[jsonValue.Current_State].indexOf(jsonValue.Input) == -1) {
            roleState_stateJSON[jsonValue.Current_State].push(jsonValue.Input);
        }
        roleState_roleJSON[jsonValue.Role] = roleState_stateJSON;
        that.parent.targetedContent.roleStateJSON = {RoleState: roleState_roleJSON};

        // I couldn't set directly to targetedContent as it's call by value not by reference
        // So I have passed another call by reference object
        that.parent.referenceComponent.stateInputJSON = that.parent.targetedContent.stateInputJSON;
        that.parent.referenceComponent.roleStateJSON = that.parent.targetedContent.roleStateJSON;

        console.log(JSON.stringify(that.parent.targetedContent.stateInputJSON, undefined, 4));
        console.log(JSON.stringify(that.parent.targetedContent.roleStateJSON, undefined, 4));
        console.log("------------------------------------------------");
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

WidgetsContainer.prototype._runSelectedStateInput = function (button_uid, title) {
    console.log("Run State");
    var that = this;

    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("Run Inputs", function () {
        var jsonValue = that.collectFormData("Save_Button");
        var resultValues = that.parent.referenceComponent.stateInputJSON['StateInput'][jsonValue['Select_Current_State']][jsonValue['Select_Input']];
        if (resultValues !== undefined) {
            that.setFormValue('Output', {
                type: 'text',
                value: resultValues['Output'],
                trimedvalue: resultValues.Output
            });
            that.setFormValue('Next_State', {
                type: 'text',
                value: resultValues['Next_State'],
                trimedvalue: resultValues.Next_State
            });
            that.setFormValue('Cycle', {type: 'text', value: resultValues['Cycle'], trimedvalue: resultValues.Cycle});
        }

    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

WidgetsContainer.prototype.getTipValuesArrays = function (currentState, currentRole) {
    var statesArray = {};
    var rolesArray = {};
    var inputArray = {};


    if (this.parent.targetedContent.stateInputJSON.StateInput !== undefined) {
        for (var state in this.parent.targetedContent.stateInputJSON.StateInput) {
            statesArray[state] = state;
        }
    }

    if (this.parent.targetedContent.roleStateJSON.RoleState !== undefined) {
        for (var role in this.parent.targetedContent.roleStateJSON.RoleState) {
            rolesArray[role] = role;
        }
    }

    if (this.parent.targetedContent.roleStateJSON.RoleState[currentRole] !== undefined
        && this.parent.targetedContent.roleStateJSON.RoleState[currentRole][currentState] != undefined) {
        this.parent.targetedContent.roleStateJSON['RoleState'][currentRole][currentState].forEach(function (value) {
            inputArray[value] = value;
        });
    }

    return {
        statesArray: statesArray,
        rolesArray: rolesArray,
        inputArray: inputArray
    }
}

WidgetsContainer.prototype._applySaveDynamoTableName = function (button_uid, title) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("Save Table Name", function () {
        var jsonValue = that.collectFormData("Save_Button");
        console.log("Save_Table_Name");
        console.log(jsonValue);
        that.parent.referenceComponent.SelectedTableName = jsonValue.tableName;
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}


WidgetsContainer.prototype.trimCellData = function (column, value) {
    console.log("Row Column Data = ", (value + ""));
    console.log("Column Name = ", column);
    console.log("Column Width = ", this.columnWidth[column]);
    console.log("canvas width = ", this.stringMeassringCTX.measureText((value )).width);

    var trimmedText = value;
    //this.stringWidth = this.stringMeassringCTX.measureText((row[col] + "")).width;
    if (this.stringMeassringCTX.measureText((value)).width > this.columnWidth[column]) {
        var i = 0;
        trimmedText = (value + "").substring(0, i + 5);
        while (this.stringMeassringCTX.measureText(trimmedText).width < this.columnWidth[column]) {
            i = i + 5;
            trimmedText = (value + "").substring(0, i + 5);
            if (trimmedText == (value + "")) {
                break;
            }
        }
        if (this.stringMeassringCTX.measureText(trimmedText).width > this.columnWidth[column]) {
            trimmedText = (value + "").substring(0, trimmedText.length - 10);
        }
    }
    return trimmedText;
}

WidgetsContainer.prototype._setupDatatableEventHandlers = function () {
    console.log("Setup DatatableEvent Handler");
    console.log(this._buttonHandlers);
    this.datatable.delegate('click', function (e) {
        if (typeof this._buttonHandlers[e.currentTarget.getData('uid')] !== "undefined") {
            this._buttonHandlers[e.currentTarget.getData('uid')].call();
        }
    }, '.datatable-button', this);
};

WidgetsContainer.prototype._applyActionMenu = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem(title, function () {
        console.log("Button ID = ", button_uid);
        eval(callback);
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

/**
 * Creates Row Menu
 * @private
 */
WidgetsContainer.prototype.resetRowMenuItems = function (button_id, title) {
    //this.rowActionMenu.removeAllMenuItems();

    this.rowActionMenu.menu.set("zIndex", this.parent.panel.get("zIndex") + 1);
    $('#' + this.rowActionMenu.menu.get('id') + ' .header-title').html(title);

    var menuWidth = $('#' + this.rowActionMenu.menu.get('boundingBox').get('id')).width();
    var titleWidth = this.stringMeassringCTX.measureText(title).width;
    if (titleWidth + 20 + 16 > menuWidth) {
        menuWidth = titleWidth + 20 + 16;
        $('#' + this.rowActionMenu.menu.get('boundingBox').get('id')).css({
            width: menuWidth
        });
    }

    $('#' + this.rowActionMenu.menu.get('boundingBox').get('id')).css({
        left: $('[data-uid="' + button_id + '"]').parent().position().left - menuWidth,
        top: $('[data-uid="' + button_id + '"]').parent().position().top + 40,
        padding: "1px 8px 1px 8px",
    });
    //$('#' + this.rowActionMenu.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').parent().position().top + 40});
    //$('#' + this.rowActionMenu.menu.get('boundingBox').get('id') + " .yui3-widget-hd").css({padding: "1px 8px 1px 8px"});
    //$('#' + this.rowActionMenu.menu.get('boundingBox').get('id') + " .yui3-widget-hd .yui3-widget-buttons").css({padding: "1px 8px 1px 8px"});

    //this.rowActionMenu.menu.align('#' + this.panel.get('boundingBox').get('id') + ' .yui3-widget-bd', [this.Y.WidgetPositionAlign.TC, this.Y.WidgetPositionAlign.TC]);
};

WidgetsContainer.prototype.addRowMenuItem = function (menuLabel, callback, addToEnd) {
    this.rowActionMenu.addMenuItem(menuLabel, callback, addToEnd);
};

WidgetsContainer.prototype.setFormValue = function (name, value) {
    if (this.datatable.data != undefined) {
        this.datatable.data.toArray().some(function (model) {
            if (model.get('Name').value == name) {
                model.set('Value', value);
                return true;
            }
            return false;
        }, this);
    }
};

WidgetsContainer.prototype.setFormMenuAction = function (name, type, action) {
    if (this.datatable.data != undefined) {
        this.datatable.data.toArray().some(function (model) {
            if (model.get('Name').value == name) {
                model.set('Menu', {type: type, value: action});
                return true;
            }
            return false;
        }, this);
    }
};

WidgetsContainer.prototype.getFormValue = function (name) {
    console.log("getFormValue");
    console.log("--------------------------------");
    console.log(name);
    var returnVal = false;
    this.datatable.data.toArray().some(function (model) {
        console.log(model.get('Name').value);
        if (model.get('Name').value == name) {
            console.log("Value Found");
            returnVal = model.get('Value');
            return true;
        }
        return false;
    }, this);
    console.log("--------------------------------");
    return returnVal;
};

WidgetsContainer.prototype.collectFormData = function (skip) {
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

WidgetsContainer.prototype._getColumnValue = function (rowIndex, colIndex, name) {
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
        'text': function (name) {
            return name.value;
        },
        'password': function () {
            return that.datatable.getCell([rowIndex, colIndex]).one('input').get('value');
        },
        'textarea': function () {
            return that.datatable.getCell([rowIndex, colIndex]).one('textarea').get('value');
        }
    };
    console.log("_getColumnValue");
    console.log(name);
    console.log(name.type);
    console.log(value[name.type]);
    if (typeof value[name.type] !== "undefined") {
        return value[name.type](name);
    }
    return "";
};

///**
// * Refreshes the datatableby calling the getTableData() function again
// * @param {Function} callback - Callback function
// */
//WidgetsContainer.prototype.refreshDatatable = function (callback, loaded_data) {
//    var that = this;
//    this.getTableData(function (tableData) {
//        that.datatable.set('data', tableData);
//        $(".panel-title").html(that.getFormValue('DisplayName').value);
//        if (typeof callback !== "undefined") {
//            callback();
//        }
//    }, loaded_data);
//};
