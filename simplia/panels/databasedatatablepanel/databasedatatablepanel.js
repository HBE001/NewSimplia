/**
 * Created by Imad on 5/4/2015.
 * Note: Modify 'DatabaseDatatablePanel' moniker through out this file to the actual name of the panel
 */
function DatabaseDatatablePanel(Y, properties) {
    //Calling base constructor
    BasicDatatablePanel.call(this, Y);

    this.colDataUrl = "./datatableservices/getcols";
    this.tableDataUrl = "./datatableservices/getdata";
    this.deleteRowsUrl = "./datatableservices/deleterows";

    this.auto_increment = '';
    this.fetchLimit = 100;
    this.queryLimits = [0,this.fetchLimit];

    this.columnClassName = "col-wrap";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
DatabaseDatatablePanel.prototype = Object.create(BasicDatatablePanel.prototype);

/*
 *
 * Init Function
 *
 */
DatabaseDatatablePanel.prototype.init = function(cb) {
    if(typeof this.tableName !== "undefined" && this.tableName) {
        var that = this;
        BasicDatatablePanel.prototype.init.call(this, function(){
            that.addRightMenuHandlers();
            if(typeof cb !== "undefined") {
                cb();
            }
        });
    }
};

DatabaseDatatablePanel.prototype.endOfScrollHandler = function() {
    var that = this;
    var lastRow = this.datatable.data.toArray().length - 1;
    this.getTableData(function(data){
        that.datatable.data.add(data);
        that.datatable.scrollTo(lastRow);
        that.queryLimits[1] += that.fetchLimit;
    }, [this.queryLimits[1], this.fetchLimit]);
};

DatabaseDatatablePanel.prototype.getColumnData = function(callback) {
    var that = this;
    $.ajax({
        url: this.colDataUrl,
        type: "POST",
        dataType: "json",
        data: "table=" + this.tableName,
        success: function(colData){
            that.auto_increment = colData.data.auto_increment || '';
            console.log("Inside Get Column Data");
            console.log(colData);
            console.log(colData.data);
            console.log(that.enhanceTableColumns(colData.data));
            callback(that.enhanceTableColumns(colData.data));
        }
    });
};

DatabaseDatatablePanel.prototype.getTableData = function(callback, limits) {
    var that = this;
    limits = limits || this.queryLimits;
    $.ajax({
        url: this.tableDataUrl,
        type: "POST",
        dataType: "json",
        data: "table=" + this.tableName + "&limits=" + JSON.stringify(limits),
        success: function(tableData) {
            console.log("Inside Get Table Data");
            console.log(tableData);
            console.log(tableData.data);
            console.log(that.createModelList(tableData.data));
            callback(that.createModelList(tableData.data));
        }
    });
};

DatabaseDatatablePanel.prototype.addRightMenuHandlers = function() {
    this.addWhiteBoardPanel();
    this.addSettingsPanel();
    this.addDeleteOption();
    this.addEditFormPanel();
    this.addViewFormPanel();
    this.addAddFormPanel();
};

DatabaseDatatablePanel.prototype.addSettingsPanel = function() {
    var that = this;
    this.addChildPanel(
        'settingsdatatablepanel',
        'settings',
        {
            panelTitle: "Table Settings",
            parentPanel: this,
            numCols: this.datatable.get('columns').length - 1
        },
        function(error, panel) {
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

DatabaseDatatablePanel.prototype.addDeleteOption = function() {
    var that = this;
    this.addRightMenuItem("Delete Record(s)", function() {
        var selectedRows = that.datatable.get('checkboxSelected');
        if (selectedRows.length) {
            that.showSimpleDialog("Delete Record(s)", "Are you sure you want to delete the selected records?", function(){
                var rowIds = [];
                selectedRows.forEach(function(row){
                    var rowInfo = {};
                    this.primaryKeys.forEach(function(key){
                        rowInfo[key] = row.record.get(key);
                    });
                    rowIds.push(rowInfo);
                }, that);
                $.ajax({
                    url: that.deleteRowsUrl,
                    type: "POST",
                    dataType: "json",
                    data: 'table=' + that.tableName + '&rows=' + JSON.stringify(rowIds),
                    success: function(data){
                        //Since all selected rows all be deleted, the _chkRecords property of the datatable will be reset
                        that.datatable._chkRecords = [];
                        that.refreshDatatable();
                    }
                });
            });
        }
    });
};

DatabaseDatatablePanel.prototype.addEditFormPanel = function() {
    var that = this;
    this.addChildPanel('editformdatatablepanel', 'editform', {panelTitle: "Edit Record", parentPanel: this}, function(error, panel){
        if(error) {
            console.log(error);
            return;
        }
        that.addRightMenuItem("Edit Record", function(){
            var selectedRows = that.datatable.get('checkboxSelected');
            if(selectedRows.length) {
                panel.setFormData(selectedRows[0].record);
                panel.showPanel();
                panel.bringToTop(that);
            }
        });
    });

};

DatabaseDatatablePanel.prototype.addViewFormPanel = function() {
    var that = this;
    this.addChildPanel('viewformdatatablepanel', 'viewform', {panelTitle: "View Details", parentPanel: this}, function(error, panel){
        if(error) {
            console.log(error);
            return;
        }
        that.addRightMenuItem("View Details", function(){
            var selectedRows = that.datatable.get('checkboxSelected');
            if(selectedRows.length) {
                panel.setFormData(selectedRows[0].record);
                panel.showPanel();
                panel.bringToTop(that);
            }
        });
    });
};

DatabaseDatatablePanel.prototype.addAddFormPanel = function() {
    var that = this;
    this.addChildPanel('addformdatatablepanel', 'addform', {panelTitle: "Add Row", parentPanel: this}, function(error, panel){
        if(error) {
            console.log(error);
            return;
        }
        that.addRightMenuItem("Add Row", function(){
            panel.showPanel();
            panel.bringToTop(that);
        });
    });
};

/* ------------------------------------------------------------- */
DatabaseDatatablePanel.prototype.addWhiteBoardPanel = function() {
    var that = this;
    this.addChildPanel('whiteboardpanel', 'whiteboard', {panelTitle: "Whiteboard", parentPanel: this}, function(error, panel){
        if(error) {
            console.log(error);
            return;
        }

        that.addRightMenuItem("Add Whiteboard", function(){
            panel.showPanel();
            panel.bringToTop(that);
            panel.startWhiteboard();
            panel.alignOverParent();
        });
    });
};


// ----------------------------------------------------


DatabaseDatatablePanel.prototype.getTableIds = function(rowId) {
    var ids = {};
    this.primaryKeys.forEach(function(key){
        ids[key] = this.datatable.data.getById(rowId).get(key);
    },this);
    return ids;
};

DatabaseDatatablePanel.prototype.createModelList = function(tableData) {
    var modelList = new this.Y.ModelList();
    tableData.forEach(function(row){
        var dataModel = new this.Y.Model();
        for(var col in row) {
            dataModel.set(col, row[col]);
        }
        if(typeof row.id === "undefined") {
            dataModel.set('id',this.Y.Crypto.UUID());
        }
        modelList.add(dataModel);
    }, this);
    return modelList;
};

DatabaseDatatablePanel.prototype.enhanceTableColumns = function(data) {
    var newColumns = [];
    data.columns.forEach(function(column){
        column.className = this.columnClassName;
        newColumns.push(column);
    },this);
    data.columns = newColumns;
    return data;
};