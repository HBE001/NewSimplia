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
function BasicFourColumnFormDataTablePanel(Y, properties) {
    //Calling base constructor
    BasicDatatablePanel.call(this, Y);

    this._buttonHandlers = {};
    this.datatableCheckbox = false;
    this._selectionColIndex = 0;
    this._nameColIndex = 1;
    this._valueColIndex = 2;
    this._menuColIndex = 3;
    this.guidUrl = "./guid/get";
    this.gdnUrl = "./gdn/get";
    this.OESEditorPanelName = "oeseditor";
    this.OESEditorPanelType = "oesinputformpanel";

    this.longTextDialogBox;
    this.stringMeassringCanvas = document.createElement('canvas');
    this.stringMeassringCTX = this.stringMeassringCanvas.getContext("2d");
    this.stringMeassringCTX.font = "11px Arial";


    this.timePickerWidget = "";
    this.stringValueWidget = "";
    this.listBoxWidget = "";
    this.radioButtonsWidget = "";
    this.telephoneNumberWidget = "";
    this.currencyWidget = "";
    this.jsonEditorWidget = "";
    this.htmlViewerWidget = "";
    this.formattingArray = {};

    this.rowActionMenu;

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
BasicFourColumnFormDataTablePanel.prototype = Object.create(BasicDatatablePanel.prototype);

/**
 * Main initialization function
 * @param {Function} cb - Callback function to be called
 */
BasicFourColumnFormDataTablePanel.prototype.init = function (cb) {
    var that = this;
    BasicDatatablePanel.prototype.init.call(this, function () {
        that._setupDatatableEventHandlers();
        that._setupLocalEventHandlers();


        $.getScript("./js/menus/customesubmenu.js", function () {
            $.getScript("./js/jquery.timepicker.js", function () {
                that.constructTimePicker();
            });
            that.constructStringValueWidget();
            $.getScript("./js/jquery.searchit.js", function () {
                that.constructListBoxWidget();
            });

            that.constructRadioButtonsWidget();

            //$.getScript("./js/PhoneNumberMetadata.js");
            $.getScript("./js/PhoneNumberNormalizer.js");
            that.constructTelephoneNumberWidget();

            $.getScript("./js/bootstrap-formhelpers-currencies.js", function () {
                that.constructCurrencyWidget();
            });

            that.constructJSONEditorWidget();
            that.constructHTMLViewerWidget();

        });

        that.rowActionMenu = new RightMenu(this.Y, {parentPanel: that, customMenu: true});
        //that.rowActionMenu.menu .set("padding", '0px 0px 0px 0px');


        if (typeof cb !== "undefined") {
            cb();
        }
    });
};

BasicFourColumnFormDataTablePanel.prototype._setupLocalEventHandlers = function () {
    var that = this;
    this.longTextDialogBox = new Y.Panel({
        headerContent: '<div class="header-title"></div>',
        bodyContent: '<div class="simple-dialog-message icon-none"></div>',
        zIndex: this.panel.get('zIndex'),
        modal: false,
        visible: false,
        centered: false,
        render: true,
        width: 500,
        buttons: {
            footer: [
                {
                    name: 'Ok',
                    label: 'OK',
                    action: 'onOK'
                }
            ]
        },
        plugins: [this.Y.Plugin.Drag]
    });

    that.longTextDialogBox.onOK = function (e) {
        e.preventDefault();
        this.hide();
        // code that executes the user confirmed action goes here
        if (this.callback) {
            this.callback();
        }
        // callback reference removed, so it won't persist
        this.callback = false;
    }


    this.Y.delegate('click', function (e) {
        var target = e.currentTarget,
            modelList = this.get('data'),
            dataArray = modelList.toArray(),
            columns = this.get('columns'),
            cellIndex = Y.Node.getDOMNode(target).cellIndex,
            rid = target.get('id'),
            r1 = this.getRecord(rid);
        var selectedColumn = columns[cellIndex].key;
        var selectedCell = r1.get(selectedColumn);
        console.log("Inside Cell Click");
        console.log(selectedColumn);
        console.log(selectedCell);
        if (selectedColumn == "Value") {
            var trimedString = selectedCell.trimedvalue;
            var originalString = selectedCell.value;
            console.log("trimedString = ", trimedString);
            console.log("originalString = ", originalString);
            if (originalString && originalString != "" && originalString != trimedString) {
                that._showLongMessageDialogBox(selectedColumn, originalString);
            }
        }
    }, "#" + this.panel.get('id'), 'td', this.datatable);
};

/*----------------------------------------------------------*/
/**
 * Displays a select role dialog with customizable title, text
 * @param {string} title - Dialog Title
 * @param {string} text - Text for the body of the dialog
 */
BasicFourColumnFormDataTablePanel.prototype._showLongMessageDialogBox = function (title, text) {
    $('#' + this.longTextDialogBox.get('id') + ' .header-title').html(title);
    $('#' + this.longTextDialogBox.get('id') + ' .simple-dialog-message').html(text);
    $('#' + this.longTextDialogBox.get('boundingBox').get('id') + ' .yui3-widget-ft').css('text-align', 'center');
    this.longTextDialogBox.align('#' + this.panel.get('boundingBox').get('id') + ' .yui3-widget-bd', [this.Y.WidgetPositionAlign.TC, this.Y.WidgetPositionAlign.TC]);
    this.longTextDialogBox.set("zIndex", this.panel.get("zIndex") + 1);
    this.longTextDialogBox.show();
};

/*----------------------------------------------------------*/
BasicFourColumnFormDataTablePanel.prototype.constructStringValueWidget = function () {
    var that = this;

    jQuery(document.createElement("div")).attr("id", "stringValueTemplate").css('display', 'none').
        html('<textarea class="stringValueTextArea" rows="2" cols="50"></textarea><br/>' +
        '<button id= "setStringButton" class= "btn btn-primary btn-block" type="button" style="text-align: center">Done</button>').appendTo("body");

    if (this.stringValueWidget == "") {
        that.stringValueWidget = new CustomeSubMenu(this.Y, {
            subMenuTitle: "Set String",
            parentPanel: that,
            parentMenu: that.rightMenu,
            isParentSubMenu: false,
            HTMLBody: $('#stringValueTemplate').html()
        });
        that.stringValueWidget.menu.set('headerContent', '<div class="header-title">Set String</div>');
    }
}

BasicFourColumnFormDataTablePanel.prototype.setStringValueListner = function (button_id, value, callback) {
    var that = this;
    $('.stringValueTextArea').val(value);
    $('#setStringButton').off('click');
    $('#setStringButton').click(function () {
        callback($('.stringValueTextArea').val());
        that.stringValueWidget.deactivate();
        $('#setStringButton').off('click');
    });
    if (button_id != "") {
        $('#' + that.stringValueWidget.menu.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
        $('#' + that.stringValueWidget.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
    }
};


BasicFourColumnFormDataTablePanel.prototype.constructListBoxWidget = function () {
    var that = this;

    jQuery(document.createElement("div")).attr("id", "listBoxTemplate").css('display', 'none').
        html('<select class="listBoxSelection" style="height = 28px; font-size=medium;"></select>' +
        '<button id= "listBoxButton" class= "btn btn-primary btn-block" type="button" style="text-align: center">Done</button>').appendTo("body");

    if (this.listBoxWidget == "") {
        that.listBoxWidget = new CustomeSubMenu(this.Y, {
            subMenuTitle: "Set String",
            parentPanel: that,
            parentMenu: that.rightMenu,
            isParentSubMenu: false,
            HTMLBody: $('#listBoxTemplate').html()
        });
        that.listBoxWidget.menu.set('headerContent', '<div class="header-title">Select Value</div>');
    }
}

BasicFourColumnFormDataTablePanel.prototype.setListBoxListner = function (listValues, button_id, callback) {
    var that = this;

    html = "";
    for (var key in listValues) {
        html += "<option value=" + key + ">" + listValues[key] + "</option>"
    }
    $(".listBoxSelection").html(html);

    $("select").searchit({
        textFields: $('.__searchit0'),
        textFieldClass: 'searchbox', // Textbox class
        dropDownClass: null,    // Dropdown class
        size: 4,                 // Elements to show when typing
        dropDown: true,
        noElementText: "No elements found"  // "No elements found" text
    });

    $('#listBoxButton').click(function () {
        callback($('.listBoxSelection').val());
        that.listBoxWidget.deactivate();
        $('#listBoxButton').off('click');
    });


    $('#' + that.listBoxWidget.menu.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + that.listBoxWidget.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
};

BasicFourColumnFormDataTablePanel.prototype.constructRadioButtonsWidget = function () {
    var that = this;

    jQuery(document.createElement("div")).attr("id", "radioButtonsTemplate").css('display', 'none').
        html('<form class="radioButtonsSelection" style=" font-size: 80%; "></form>' +
        '<button id= "radioButtonsSelectionButton" class= "btn btn-primary btn-block" type="button" style="text-align: center">Done</button>').appendTo("body");

    if (this.radioButtonsWidget == "") {
        that.radioButtonsWidget = new CustomeSubMenu(this.Y, {
            subMenuTitle: "Set String",
            parentPanel: that,
            parentMenu: that.rightMenu,
            isParentSubMenu: false,
            HTMLBody: $('#radioButtonsTemplate').html()
        });
        that.radioButtonsWidget.menu.set('headerContent', '<div class="header-title">Select Value</div>');
    }
}

BasicFourColumnFormDataTablePanel.prototype.setRadioButtonsListner = function (listValues, button_id, callback) {
    var that = this;

    html = "";
    for (var key in listValues) {
        html += "<input type='radio' name='radioSelection' value=" + key + ">" + listValues[key] + "<br>"
    }
    $(".radioButtonsSelection").html(html);

    $('#radioButtonsSelectionButton').click(function () {
        callback($("input[type='radio'][name='radioSelection']:checked").val());
        that.radioButtonsWidget.deactivate();
        $('#radioButtonsSelectionButton').off('click');
    });

    $('#' + that.radioButtonsWidget.menu.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + that.radioButtonsWidget.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
    //$('#' + that.radioButtonsWidget.menu.get('boundingBox').get('id') + " .yui3-widget-hd").css({padding: '1px 1px 1px 1px'});
};

BasicFourColumnFormDataTablePanel.prototype.constructTelephoneNumberWidget = function () {
    jQuery(document.createElement("div")).attr("id", "telephoneNumberTemplate").css('display', 'none').
        //html('Phone: (<input type="text" name="phone-1" maxlength="3" type="tel" style="width: 30px;">) <input type="text" name="phone-2" maxlength="3" type="tel" style="width: 30px;">- <input type="text" name="phone-3" maxlength="4" type="tel" style="width: 30px;"><br/>' +
        html('<input type="text" name="phoneNumber" type="tel" style="width: 99%;">' +
        '<br/><button id= "telephoneNumberButton" class= "btn btn-primary btn-block" type="button" style="text-align: center">Done</button>').appendTo("body");


    var that = this;
    if (this.telephoneNumberWidget == "") {
        that.telephoneNumberWidget = new CustomeSubMenu(this.Y, {
            subMenuTitle: "Set String",
            parentPanel: that,
            parentMenu: that.rightMenu,
            isParentSubMenu: false,
            HTMLBody: $('#telephoneNumberTemplate').html()
        });
        that.telephoneNumberWidget.menu.set('headerContent', '<div class="header-title">Enter Phone Number</div>');
    }
}

BasicFourColumnFormDataTablePanel.prototype.setTelephoneNumberListner = function (button_id, callback) {
    var that = this;

    $('#telephoneNumberButton').click(function () {
        console.log('=============================================');
        console.log($('[name="phoneNumber"]').val());
        console.log(PhoneNumberNormalizer.Normalize($('[name="phoneNumber"]').val()));
        console.log('=============================================');
        callback(PhoneNumberNormalizer.Normalize($('[name="phoneNumber"]').val()));
        that.telephoneNumberWidget.deactivate();
        $('#telephoneNumberButton').off('click');
    });

    $('#' + that.telephoneNumberWidget.menu.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + that.telephoneNumberWidget.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
    //$('#' + that.telephoneNumberWidget.menu.get('boundingBox').get('id') + " .yui3-widget-hd").css({padding: '1px 1px 1px 1px'});
};


BasicFourColumnFormDataTablePanel.prototype.constructCurrencyWidget = function () {
    var that = this;

    jQuery(document.createElement("div")).attr("id", "currencyTemplate").css('display', 'none').
        html('Currency:<br/> <input type="text" name="currencyValue">' +
        '<br/><button id= "currencyButton" class= "btn btn-primary btn-block" type="button" style="text-align: center">Done</button>').appendTo("body");

    if (this.currencyWidget == "") {
        that.currencyWidget = new CustomeSubMenu(this.Y, {
            subMenuTitle: "Set String",
            parentPanel: that,
            parentMenu: that.rightMenu,
            isParentSubMenu: false,
            HTMLBody: $('#currencyTemplate').html()
        });
        that.currencyWidget.menu.set('headerContent', '<div class="header-title">Enter Currency</div>');
    }
}

BasicFourColumnFormDataTablePanel.prototype.setCurrencyListner = function (button_id, callback) {
    var that = this;

    $('#currencyButton').click(function () {
        callback(parseFloat($('[name="currencyValue"]').val()));
        that.currencyWidget.deactivate();
        $('#currencyButton').off('click');
    });

    $('#' + that.currencyWidget.menu.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + that.currencyWidget.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
};

BasicFourColumnFormDataTablePanel.prototype.constructJSONEditorWidget = function () {
    var that = this;
    this.addChildPanel('jsoneditorpanel', 'jsoneditorpanel', {
        panelTitle: "JSON Editor",
        parentPanel: this
    }, function (error, panel) {
        if (error) {
            console.log(error);
            return;
        }
        that.jsonEditorWidget = panel;
    });
};

BasicFourColumnFormDataTablePanel.prototype.setJSONEditorListner = function (button_id, existingJSON, callback) {
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

BasicFourColumnFormDataTablePanel.prototype.constructHTMLViewerWidget = function () {
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

BasicFourColumnFormDataTablePanel.prototype.setHTMLViewerListner = function (button_id, formData, callback) {
    this.htmlViewerWidget.viewAsHTML(formData);

    this.htmlViewerWidget.parentCallBack = callback;
    this.htmlViewerWidget.showPanel();
    this.htmlViewerWidget.bringToTop(this);

    $('#' + this.htmlViewerWidget.panel.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + this.htmlViewerWidget.panel.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
};


BasicFourColumnFormDataTablePanel.prototype.constructTimePicker = function () {
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

    jQuery(document.createElement("div")).attr("id", "timePicker").css('display', 'none').
        html('<p class="datepairExample" style="margin: 0;">' +
        'Date:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
        'Time:<br/> ' +
        '<input type="text" class="date start"/><input type="text" class="time start" />' +
            //timezoneOffsitePicker + '<br/>' +
        '<br/><button id= "startButton" class= "btn btn-primary btn-block" type="button" style="text-align: center">Done</button></p>').appendTo("body");

    if (this.timePickerWidget == "") {
        // ------------------------------------------------------------
        that.timePickerWidget = new CustomeSubMenu(this.Y, {
            subMenuTitle: "Select TimePicker",
            parentPanel: that,
            parentMenu: that.rightMenu,
            isParentSubMenu: false,
            HTMLBody: $('#timePicker').html()
        });
        that.timePickerWidget.menu.set('headerContent', '<div class="header-title">Select Time</div>');
    }
};

BasicFourColumnFormDataTablePanel.prototype.setTimePickerListner = function (button_id, callback) {
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
    $('#datepairExample').datepair();

    $('#startButton').click(function () {
        console.log("Start clicked");
        var startingTime = new Datepair($('.datepairExample')[0]).getStartTime();
        //var timeOffsite = $('.timezoneOffsite').val() * 60 * 60;
        callback(startingTime);
        that.timePickerWidget.deactivate()
        $('#startButton').off('click');
    });


    $('#' + that.timePickerWidget.menu.get('boundingBox').get('id')).css({left: $('[data-uid="' + button_id + '"]').position().left});
    $('#' + that.timePickerWidget.menu.get('boundingBox').get('id')).css({top: $('[data-uid="' + button_id + '"]').position().top + 60});
};

/**
 * Overriden function to prepare column data
 * @param {columnDataCallback} callback
 */
BasicFourColumnFormDataTablePanel.prototype.getColumnData = function (callback) {
    var colData = {
        columns: [
            {
                key: "Name",
                allowHTML: true,
                formatter: this._formFormatter.bind(this)
            },
            {
                key: "Value",
                allowHTML: true,
                formatter: this._formFormatter.bind(this),
                emptyCellValue: '<input type="text"/>'
            },
            {
                key: "Menu",
                label: '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;">&#9776;</button>',
                allowHTML: true,
                formatter: this._formFormatter.bind(this),
                emptyCellValue: '<input type="button"/>'
            }
        ],
        primaryKeys: ["Name"]
    };
    //callback(colData);
    callback(this.enhanceTableColumns(colData));
};

BasicFourColumnFormDataTablePanel.prototype.enhanceTableColumns = function (data) {
    var columnIndex = 0;
    this.columnWidth["chkSelect"] = this.chkSelectNumberOfPixels;
    this.columnsIndexes["chkSelect"] = columnIndex++;
    data.columns.forEach(function (column) {
        this.columnWidth[column.key] = (this.defaultNumberOfPixels > column.key.length ? this.defaultNumberOfPixels : column.key.length);
        this.columnsIndexes[column.key] = columnIndex++;
    }, this);
    this.columnWidth["Menu"] = this.menuColumnNumberOfPixels;
    this.columnsIndexes["Menu"] = columnIndex;
    return data;
};

/**
 *
 * @param {Object} o
 * @returns {*}
 * @private
 */
BasicFourColumnFormDataTablePanel.prototype._formFormatter = function (o) {
    console.log("From Formater");
    console.log(o);
    console.log(o.data);
    console.log(o.column);
    console.log(".-----------------------------------------------");

    var retVal = '';
    if ((typeof o.value.type === "undefined") || !o.value.type) {
        o.value.type = "default";
    } else if (o.column.key != "Value" && o.data.Value.type == "button") {
        return "";
    }

    var that = this;

    this.formattingArray = {
        'textbox': function (o) {
            var uid = 'btn_' + o.data.id;
            var trimedDataCell = that.trimCellData(o.column.key, o.value.value);
            return '<input type="text" id="txt_' + uid + '" value="' + trimedDataCell + '" style="font-size: small; outline: 0;"/>';
        },
        'textbox-map': function (o) {
            var uid = 'btn_' + o.data.id;
            //var html = '<input type="text" id="txt_' + uid + '" value="' + JSON.stringify(trimedDataCell) + '"/>';
            that._buttonHandlers[uid] = that._createJSONEditor.bind(that, uid, o.data.Name.value, function (guid) {
                var trimedDataCell = that.trimCellData(o.column.key, guid);
                that.setFormValue(o.data.Name.value, {type: 'text', value: guid, trimedvalue: trimedDataCell});
                //$('#txt_' + uid).html(trimedDataCell)
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'textbox-id': function (o) {
            var uid = 'btn_' + o.data.id;
            //var html = '<input type="text" id="txt_' + uid + '" value="' + trimedDataCell + '"/>';
            that._buttonHandlers[uid] = that._getGUID.bind(that, uid, o.data.Name.value, function (guid) {
                var trimedDataCell = that.trimCellData(o.column.key, guid);
                that.setFormValue(o.data.Name.value, {type: 'text', value: guid, trimedvalue: trimedDataCell});
                //$('#txt_' + uid).html(trimedDataCell)
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'textbox-ost': function (o) {
            var uid = 'btn_' + o.data.id;

            //var html = '<input type="text" id="txt_' + uid + '" value="' + trimedDataCell + '"/>';
            that._buttonHandlers[uid] = that._generateOST.bind(that, uid, o.data.Name.value, function (ost) {
                var trimedDataCell = that.trimCellData(o.column.key, ost);
                that.setFormValue(o.data.Name.value, {type: 'text', value: ost, trimedvalue: trimedDataCell});
                //$('#txt_' + uid).html(trimedDataCell)
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'textbox-odn': function (o) {
            var uid = 'btn_' + o.data.id;
            //var html = '<input type="text" id="txt_' + uid + '" value="' + trimedDataCell + '"/>';
            that._buttonHandlers[uid] = that._getGDN.bind(that, uid, o.data.Name.value, function (gdn) {
                var trimedDataCell = that.trimCellData(o.column.key, gdn);
                that.setFormValue(o.data.Name.value, {type: 'text', value: gdn, trimedvalue: trimedDataCell});
                //$('#txt_' + uid).html(trimedDataCell)
            });
            //return '<span style="color: #ffffff !important; font-weight: bold!important;">&#9776;</span>' +
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'textbox-oes': function (o) {
            var uid = 'btn_' + o.data.id;
            //var html = '<input type="text" id="txt_' + uid + '" value="' + trimedDataCell + '"/>';
            that._buttonHandlers[uid] = that._displayOESEditor.bind(that, uid, o.data.Name.value, function (oes) {
                var trimedDataCell = that.trimCellData(o.column.key, oes);
                that.setFormValue(o.data.Name.value, {type: 'text', value: oes, trimedvalue: trimedDataCell});
                //$('#txt_' + uid).html(trimedDataCell)
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'dateTime': function (o) {
            var uid = 'btn_' + o.data.id;
            //var html = '<input type="text" id="txt_' + uid + '" value="' + trimedDataCell + '"/>';
            that._buttonHandlers[uid] = that._displayTimePicker.bind(that, uid, o.data.Name.value, function (time) {
                var trimedDataCell = that.trimCellData(o.column.key, time);
                that.setFormValue(o.data.Name.value, {type: 'text', value: time, trimedvalue: trimedDataCell});
                //$('#txt_' + uid).html(trimedDataCell)
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'string': function (o) {
            console.log("In Basic$COlumnDatatable _FormFormatter: String: ");
            console.log(that);
            var uid = 'btn_' + o.data.id;
            console.log("UID" , uid);
            //var html = '<input type="text" id="txt_' + uid + '" value="' + trimedDataCell + '"/>';
            that._buttonHandlers[uid] = that._displayStringValuePicker.bind(that, uid, o.data.Name.value, function (string) {
                var trimedDataCell = that.trimCellData(o.column.key, string);
                that.setFormValue(o.data.Name.value, {type: 'text', value: string, trimedvalue: trimedDataCell});
                //$('#txt_' + uid).html(trimedDataCell)
            });
            console.log("that._buttonHandlers[uid]" , that._buttonHandlers[uid]);
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'tableName': function (o) {
            var uid = 'btn_' + o.data.id;
            //var html = '<input type="text" id="txt_' + uid + '" value="' + trimedDataCell + '"/>';
            that._buttonHandlers[uid] = that._displayStringValuePicker.bind(that, uid, o.data.Name.value, function (string) {
                //var trimedDataCell = that.trimCellData(o.column.key, string);
                //that.setFormValue(o.data.Name.value, {type: 'text', value: string, trimedvalue: trimedDataCell});
                that.tableName = string;
                that.refreshDatatable();
                //$('#txt_' + uid).html(trimedDataCell)
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
            that._buttonHandlers[uid] = that._displayListBoxPicker.bind(that, o.value.value, uid, o.data.Name.value, function (time) {
                var trimedDataCell = that.trimCellData(o.column.key, time);
                that.setFormValue(o.data.Name.value, {type: 'text', value: time, trimedvalue: trimedDataCell});
                //$('#txt_' + uid).html(trimedDataCell)
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'radioButtons': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayRadioButtonPicker.bind(that, o.value.value, uid, o.data.Name.value, function (time) {
                var trimedDataCell = that.trimCellData(o.column.key, time);
                that.setFormValue(o.data.Name.value, {type: 'text', value: time, trimedvalue: trimedDataCell});
                //$('#txt_' + uid).html(trimedDataCell)
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'telephone': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayTelephoneNumberPicker.bind(that, uid, o.data.Name.value, function (time) {
                var trimedDataCell = that.trimCellData(o.column.key, time);
                that.setFormValue(o.data.Name.value, {type: 'text', value: time, trimedvalue: trimedDataCell});
                //$('#txt_' + uid).html(trimedDataCell)
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'currency': function (o) {
            var uid = 'btn_' + o.data.id;
            that._buttonHandlers[uid] = that._displayCurrencyPicker.bind(that, uid, o.data.Name.value, function (time) {
                var trimedDataCell = that.trimCellData(o.column.key, time);
                that.setFormValue(o.data.Name.value, {type: 'text', value: time, trimedvalue: trimedDataCell});
                //$('#txt_' + uid).html(trimedDataCell)
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
                //$('#txt_' + uid).html(trimedDataCell)
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
                    //if (o.data.Name.value == "CurrentContext") {
                    that.setFormValue(o.data.Name.value, {
                        type: 'text',
                        value: json,
                        specialValue: true
                    });
                    //} else {
                    //    alert("Error: Can not edit on that context");
                    //}
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
                    //if (o.data.Name.value == "CurrentContext") {
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
                    //} else {
                    //    alert("Error: Can not edit on that context");
                    //}
                } else {
                    alert("Error: It's Final " + that.getFormValue('MetaType').value);
                }
            });
            return '<button type="button" class="datatable-button" style="border: 0; padding: 0; margin: 0;color: #0072C5 !important; font-weight: bold!important; background-color: Transparent; font-size: 100%;" data-uid="' + uid + '">&#9776;</button>';
        },
        'button': function (o) {
            var uid = 'btn_' + o.data.id;
            console.log("Button Formater");
            console.log(o.data);
            console.log("< =========================================== >");
            console.log(o.value);
            console.log("< =========================================== >");

            that._buttonHandlers[uid] = that._applyActionMenu.bind(that, uid, o.data.Name.value.replace("Button", ""), o.value.value.callback);

            //that._buttonHandlers[uid] = o.value.callback;
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
            //return '<div>' + trimedDataCell + '</div>';
        },
        'text-field': function (o) {
            var uid = 'btn_' + o.data.id;
            var trimedDataCell = that.trimCellData(o.column.key, o.value.value);
            return '<div type="text" id="txt_field_' + uid + '" style="color: #0072C5 !important; font-weight: bold!important;">' + trimedDataCell + '</div>';
            //return '<div>' + trimedDataCell + '</div>';
        },
        'textarea': function (o) {
            var trimedDataCell = that.trimCellData(o.column.key, o.value.value);
            return '<textarea cols="50" rows="10">' + trimedDataCell + '</textarea>';
        },
        'default': function (o) {
            var trimedDataCell = that.trimCellData(o.column.key, o.value.value);
            return '<input type="text" value="' + trimedDataCell + '" style="font-size: small;"/>';
        }
    };
    return this.formattingArray[o.value.type](o);
};

BasicFourColumnFormDataTablePanel.prototype.getFormNameValue = function (key) {
    if (typeof this.formData !== "undefined") {
        return this.formData.get(key);
    }
    return '';
};


BasicFourColumnFormDataTablePanel.prototype.collectFormData = function (skip) {
    var data = {};

    this.datatable.data.toArray().forEach(function (model, index) {
        var value;
        console.log("------------------------------------");
        console.log("Collect Form Data");
        console.log(model);
        console.log(index);
        console.log("------------------------------------");
        if (value = this._getColumnValue(index, this.columnsIndexes['Value'], model.get('Value'))) {
            var name = model.get('customId') ? model.get('id') : this._getColumnValue(index, this.columnsIndexes['Name'], model.get('Name'));
            if (!($.isArray(skip)) || ($.inArray(model.get('Name').value, skip) == -1)) {
                console.log("--------------------------------------");
                console.log(name);
                console.log(value);
                console.log("--------------------------------------");
                if (this.tagArray[model.get('Name').value] == 'json') {
                    //data[model._state.data.Name.value.value] = JSON.parse(value);
                    console.log("typeof Value = ", typeof value);
                    data[model.get('Name').value] = (this._tryParseJSON(value) ? this._tryParseJSON(value) : value);
                } else {
                    data[model.get('Name').value] = value;
                }
            }
        }
    }, this);
    return data;
};

BasicFourColumnFormDataTablePanel.prototype.collectSelectedFormData = function () {
    var data = {};
    this.datatable.get('checkboxSelected').forEach(function (row) {
        data[row.record.get('Name')] = this.datatable.getRow(row.record).one('td input[type=text]').get('value');
    }, this);

    return data;
};

BasicFourColumnFormDataTablePanel.prototype._setupDatatableEventHandlers = function () {
    this.datatable.delegate('click', function (e) {
        if (typeof this._buttonHandlers[e.currentTarget.getData('uid')] !== "undefined") {
            this._buttonHandlers[e.currentTarget.getData('uid')].call();
        }
    }, '.datatable-button', this);
};

BasicFourColumnFormDataTablePanel.prototype.setFormValue = function (name, value) {
    this.datatable.data.toArray().some(function (model) {
        console.log("checking Value of = ", model.get('Name').value);
        if (model.get('Name').value == name) {
            model.set('Value', value);
            return true;
        }
        return false;
    }, this);
    console.log("--------------------------");
};

BasicFourColumnFormDataTablePanel.prototype.getFormValue = function (name) {
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


BasicFourColumnFormDataTablePanel.prototype.addTableDataRow = function (name, value, menu, id) {
    return {
        id: id || this.Y.Crypto.UUID(),
        customId: (typeof id !== "undefined"),
        Name: name,
        Value: value,
        Menu: menu
    };
};

BasicFourColumnFormDataTablePanel.prototype._getColumnValue = function (rowIndex, colIndex, name) {
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

BasicFourColumnFormDataTablePanel.prototype._tryParseJSON = function (jsonString) {
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

BasicFourColumnFormDataTablePanel.prototype._getGUID = function (button_uid, title, callback) {
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

BasicFourColumnFormDataTablePanel.prototype._getGDN = function (button_uid, title, callback) {
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

BasicFourColumnFormDataTablePanel.prototype._createJSONEditor = function (button_uid, title, callback) {
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


BasicFourColumnFormDataTablePanel.prototype._generateOST = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("JSONEditor", function () {
        var time = (new Date()).toISOString();
        callback(time);
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

BasicFourColumnFormDataTablePanel.prototype._displayOESEditor = function (button_uid, title, callback) {
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

BasicFourColumnFormDataTablePanel.prototype._displayCurrencyPicker = function (button_uid, title, callback) {
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

BasicFourColumnFormDataTablePanel.prototype._displayJSONEditor = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("JSON Editor", function () {
        that.setJSONEditorListner(button_uid, that.getFormValue(title).value, callback);
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

BasicFourColumnFormDataTablePanel.prototype._displayContextEditor = function (button_uid, title, JSONEditor_callback, HTMLViewer_callback) {
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
            referenceComponent: that.getFormValue(title).value,
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

BasicFourColumnFormDataTablePanel.prototype._displayTelephoneNumberPicker = function (button_uid, title, callback) {
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

BasicFourColumnFormDataTablePanel.prototype._displayListBoxPicker = function (listvalues, button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem("Open Listbox", function () {
        console.log("Button ID = ", button_uid);
        listValues = {
            "Name1": "Name1",
            "Name2": "Name2",
            "Name3": "Name3",
            "Age1": "Age1",
            "Age2": "Age2",
            "Gender": "Gender"
        };
        that.listBoxWidget.callbackFunction = (function () {
            console.log("DataPicker callback function");
            that.setListBoxListner(listValues, button_uid, callback);
        });
        that.listBoxWidget.activate();
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

BasicFourColumnFormDataTablePanel.prototype._displayRadioButtonPicker = function (listvalues, button_uid, title, callback) {
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


BasicFourColumnFormDataTablePanel.prototype._displayStringValuePicker = function (button_uid, title, callback) {
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

BasicFourColumnFormDataTablePanel.prototype._displayTimePicker = function (button_uid, title, callback) {
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
}

BasicFourColumnFormDataTablePanel.prototype._applyActionMenu = function (button_uid, title, callback) {
    var that = this;
    this.rowActionMenu.removeAllMenuItems();
    this.addRowMenuItem(title, function () {
        console.log("Button ID = ", button_uid);
        eval(callback);
    }, true);
    this.resetRowMenuItems(button_uid, title);
    this.rowActionMenu.menu.show();
}

BasicFourColumnFormDataTablePanel.prototype.resetPanel = function (skip) {
    this.datatable.data.toArray().forEach(function (model, index) {
        var name = model.get('customId') ? model.get('id') : this._getColumnValue(index, this.columnsIndexes['Name'], model.get('Name'));
        if (!($.isArray(skip)) || ($.inArray(name, skip) == -1)) {
            this._resetColumn(index, this.columnsIndexes['Value'], model.get('Value'));
        }
        ;
    }, this);
};

BasicFourColumnFormDataTablePanel.prototype._resetColumn = function (rowIndex, colIndex, name) {
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
        'text': function (name) {

        },
        'password': function () {
            that.datatable.getCell([rowIndex, colIndex]).one('input').set('value', '');
        },
        'textarea': function () {
            that.datatable.getCell([rowIndex, colIndex]).one('textarea').set('value', '');
        }
    };
    if (typeof column[name.type] !== "undefined") {
        column[name.type](name);
    }
};

BasicFourColumnFormDataTablePanel.prototype.trimCellData = function (column, value) {
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

/**
 * Creates Row Menu
 * @private
 */
BasicFourColumnFormDataTablePanel.prototype.resetRowMenuItems = function (button_id, title) {
    //this.rowActionMenu.removeAllMenuItems();

    this.rowActionMenu.menu.set("zIndex", this.panel.get("zIndex") + 1);
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

BasicFourColumnFormDataTablePanel.prototype.addRowMenuItem = function (menuLabel, callback, addToEnd) {
    this.rowActionMenu.addMenuItem(menuLabel, callback, addToEnd);
};