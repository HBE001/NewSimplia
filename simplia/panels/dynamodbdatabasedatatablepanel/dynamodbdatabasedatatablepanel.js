/**
 * Created by Imad on 5/4/2015.
 * Note: Modify 'DatabaseDatatablePanel' moniker through out this file to the actual name of the panel
 */
function DynamodbDatabaseDatatablePanel(Y, properties) {
    //Calling base constructor
    BasicDatatablePanel.call(this, Y);

    this.colDataUrl = "./dynamodbdatatableservices/getcols";
    this.tableDataUrl = "./dynamodbdatatableservices/getdata";
    this.deleteRowsUrl = "./dynamodbdatatableservices/deleterows";

    //this.auto_increment
    this.fetchLimit = 100;
    this.queryLimits = [0, this.fetchLimit];
    this.columnWidth = {};
    this.chkSelectNumberOfPixels = 32;
    this.defaultNumberOfPixels = 150;
    this.pixelPerChar = 6.5;
    this.longTextDialogBox;

    this.stringMeassringCanvas = document.createElement('canvas');
    this.stringMeassringCTX = this.stringMeassringCanvas.getContext("2d");
    this.stringMeassringCTX.font = "11px Arial";
    this.stringWidth;


    this.loadedTableData;

    this.columnClassName = "col-wrap";

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
DynamodbDatabaseDatatablePanel.prototype = Object.create(BasicDatatablePanel.prototype);

/*
 *
 * Init Function
 *
 */
DynamodbDatabaseDatatablePanel.prototype.init = function (cb) {
    if (typeof this.tableName !== "undefined" && this.tableName) {
        var that = this;
        BasicDatatablePanel.prototype.init.call(this, function () {
            console.log("setting the column size");
            that.addRightMenuHandlers();
            that._setupLocalEventHandlers();
            if (typeof cb !== "undefined") {
                cb();
            }
        });
    }
};

DynamodbDatabaseDatatablePanel.prototype._setupLocalEventHandlers = function () {
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
        var selectedCell = r1.get(selectedColumn + "-fullValue");
        if (selectedColumn != "chkSelect" && r1.get(selectedColumn) != r1.get(selectedColumn + "-fullValue")) {
            that._showLongMessageDialogBox(selectedColumn, selectedCell);
        }
    }, "#" + this.panel.get('id'), 'td', this.datatable);
};

/*----------------------------------------------------------*/
/**
 * Displays a select role dialog with customizable title, text
 * @param {string} title - Dialog Title
 * @param {string} text - Text for the body of the dialog
 */
DynamodbDatabaseDatatablePanel.prototype._showLongMessageDialogBox = function (title, text) {
    $('#' + this.longTextDialogBox.get('id') + ' .header-title').html(title);
    $('#' + this.longTextDialogBox.get('id') + ' .simple-dialog-message').html(text);
    $('#' + this.longTextDialogBox.get('boundingBox').get('id') + ' .yui3-widget-ft').css('text-align', 'center');
    this.longTextDialogBox.align('#' + this.panel.get('boundingBox').get('id') + ' .yui3-widget-bd', [this.Y.WidgetPositionAlign.TC, this.Y.WidgetPositionAlign.TC]);
    this.longTextDialogBox.set("zIndex", this.panel.get("zIndex") + 1);
    this.longTextDialogBox.show();
};

/*----------------------------------------------------------*/
DynamodbDatabaseDatatablePanel.prototype.endOfScrollHandler = function () {
    var that = this;
    var lastRow = this.datatable.data.toArray().length - 1;
    this.getTableData(function (data) {
        that.datatable.data.add(data);
        that.datatable.scrollTo(lastRow);
        that.queryLimits[1] += that.fetchLimit;
    }, [this.queryLimits[1], this.fetchLimit]);
};

DynamodbDatabaseDatatablePanel.prototype.getColumnData = function (callback) {
    var that = this;
    $.ajax({
        url: this.colDataUrl,
        type: "POST",
        dataType: "json",
        data: "table=" + this.tableName,
        success: function (colData) {
            //that.auto_increment = colData.data.auto_increment || '';
            console.log("GET Column Data");
            console.log(colData);
            console.log(colData.data);
            console.log(that.enhanceTableColumns(colData.data));
            callback(that.enhanceTableColumns(colData.data));
        }
    });
};

DynamodbDatabaseDatatablePanel.prototype.getTableData = function (callback, limits) {
    var that = this;
    limits = limits || this.queryLimits;
    $.ajax({
        url: this.tableDataUrl,
        type: "POST",
        dataType: "json",
        data: "table=" + this.tableName + "&limits=" + JSON.stringify(limits),
        success: function (tableData) {
            that.loadedTableData = tableData.data;
            console.log("GET Table Data");
            console.log(tableData.data);
            console.log(that.trimTableData());
            console.log(that.loadedTableData);
            console.log(that.createModelList(tableData.data));
            callback(that.createModelList(that.trimTableData()));
        }
    });
};

DynamodbDatabaseDatatablePanel.prototype.addRightMenuHandlers = function () {
    this.addWhiteBoardPanel();
    this.addSettingsPanel();
    this.addDeleteOption();
    this.addEditFormPanel();
    this.addViewFormPanel();
    this.addAddFormPanel();
};

DynamodbDatabaseDatatablePanel.prototype.addSettingsPanel = function () {
    var that = this;
    this.addChildPanel(
        'dynamofourcolumnsettingspanel',
        'Settings',
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

DynamodbDatabaseDatatablePanel.prototype.addDeleteOption = function () {
    var that = this;
    this.addRightMenuItem("Delete Record(s)", function () {
        var selectedRows = that.datatable.get('checkboxSelected');
        if (selectedRows.length) {
            that.showSimpleDialog("Delete Record(s)", "Are you sure you want to delete the selected records?", function () {
                var rowIds = [];
                selectedRows.forEach(function (row) {
                    var rowInfo = {};
                    this.primaryKeys.forEach(function (key) {
                        rowInfo[key] = row.record.get(key);
                    });
                    rowIds.push(rowInfo);
                }, that);
                $.ajax({
                    url: that.deleteRowsUrl,
                    type: "POST",
                    dataType: "json",
                    data: 'table=' + that.tableName + '&rows=' + JSON.stringify(rowIds),
                    success: function (data) {
                        //Since all selected rows all be deleted, the _chkRecords property of the datatable will be reset
                        that.datatable._chkRecords = [];
                        that.refreshDatatable();
                    }
                });
            });
        }
    });
};

DynamodbDatabaseDatatablePanel.prototype.addEditFormPanel = function () {
    var that = this;
    this.addChildPanel('dynamodbeditformdatatablepanel', 'editform', {
        panelTitle: "Edit Record",
        parentPanel: this
    }, function (error, panel) {
        if (error) {
            console.log(error);
            return;
        }
        that.addRightMenuItem("Edit Record", function () {
            var selectedRows = that.datatable.get('checkboxSelected');
            if (selectedRows.length) {
                panel.setFormData(selectedRows[0].record);
                panel.showPanel();
                panel.bringToTop(that);
            }
        });
    });

};

DynamodbDatabaseDatatablePanel.prototype.addViewFormPanel = function () {
    var that = this;
    this.addChildPanel('dynamodbviewformdatatablepanel', 'viewform', {
        panelTitle: "View Details",
        parentPanel: this
    }, function (error, panel) {
        if (error) {
            console.log(error);
            return;
        }
        that.addRightMenuItem("View Details", function () {
            var selectedRows = that.datatable.get('checkboxSelected');
            if (selectedRows.length) {
                panel.setFormData(selectedRows[0].record);
                panel.showPanel();
                panel.bringToTop(that);
            }
        });
    });
};

DynamodbDatabaseDatatablePanel.prototype.addAddFormPanel = function () {
    var that = this;
    this.addChildPanel('dynamodbaddformdatatablepanel', 'addform', {
        panelTitle: "Add Row",
        parentPanel: this
    }, function (error, panel) {
        if (error) {
            console.log(error);
            return;
        }
        that.addRightMenuItem("Add Row", function () {
            panel.showPanel();
            panel.bringToTop(that);
        });
    });
};

/* ------------------------------------------------------------- */
DynamodbDatabaseDatatablePanel.prototype.addWhiteBoardPanel = function () {
    var that = this;
    this.addChildPanel('whiteboardpanel', 'whiteboard', {
        panelTitle: "Whiteboard",
        parentPanel: this
    }, function (error, panel) {
        if (error) {
            console.log(error);
            return;
        }

        that.addRightMenuItem("Add Whiteboard", function () {
            panel.showPanel();
            panel.bringToTop(that);
            panel.startWhiteboard();
            panel.alignOverParent();
        });
    });
};

// ----------------------------------------------------
DynamodbDatabaseDatatablePanel.prototype.getTableIds = function (rowId) {
    var ids = {};
    this.primaryKeys.forEach(function (key) {
        ids[key] = this.datatable.data.getById(rowId).get(key);
    }, this);
    return ids;
};

DynamodbDatabaseDatatablePanel.prototype.enhanceTableColumns = function (data) {
    var newColumns = [];
    this.columnWidth["chkSelect"] = this.chkSelectNumberOfPixels;
    data.columns.forEach(function (column) {
        column.className = this.columnClassName;
        column.editor = "inline";
        //column.width = "20%";
        column.resizeable = true;
        this.columnWidth[column.key] = (this.defaultNumberOfPixels > column.key.length ? this.defaultNumberOfPixels : column.key.length);
        newColumns.push(column);
    }, this);
    data.columns = newColumns;
    return data;
};

DynamodbDatabaseDatatablePanel.prototype.createModelList = function (tableData) {
    var modelList = new this.Y.ModelList();
    tableData.forEach(function (row) {
        var dataModel = new this.Y.Model();
        for (var col in row) {
            dataModel.set(col, row[col]+ "");
            dataModel.set(col + "-fullValue", row[col + "-fullValue"]);
        }
        if (typeof row.id === "undefined") {
            dataModel.set('id', this.Y.Crypto.UUID());
        }
        modelList.add(dataModel);
    }, this);
    return modelList;
};

DynamodbDatabaseDatatablePanel.prototype.trimTableData = function () {
    var returnedArray = [];
    this.loadedTableData.forEach(function (row) {
        var dataModel = {};
        for (var col in row) {
            console.log(" ==================================== ");
            console.log("Row Column Data = ", (row[col] + ""));
            console.log("Column Width = ", this.columnWidth[col]);
            console.log("canvas width = ", this.stringMeassringCTX.measureText((row[col] + "")).width);

            //this.stringWidth = this.stringMeassringCTX.measureText((row[col] + "")).width;

            if (this.stringMeassringCTX.measureText((row[col] + "")).width > this.columnWidth[col]) {
                dataModel[col] = (row[col] + "").substring(0, 15) + " ...";
                var i = 0;
                var trimmedText = (row[col] + "").substring(0, i + 5);
                while(this.stringMeassringCTX.measureText(trimmedText).width < this.columnWidth[col]){
                    i = i + 5;
                    trimmedText = (row[col] + "").substring(0, i + 5);
                    if (trimmedText == (row[col] + "")){
                        break;
                    }
                }
                if (this.stringMeassringCTX.measureText(trimmedText).width > this.columnWidth[col]) {
                    trimmedText = (row[col] + "").substring(0, trimmedText.length - 10) + " ...";
                }
                dataModel[col] = trimmedText;
            } else {
                dataModel[col] = (row[col] + "");
            }

            dataModel[col + "-fullValue"] = (row[col] + "");
        }
        returnedArray.push(dataModel);
    }, this);
    return returnedArray;
};