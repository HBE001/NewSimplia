/**
 * Created by Imad on 5/4/2015.
 *
 */
function SqliteDatatablePanel(Y, properties) {
    //Calling base constructor
    BasicDatabaseDatatablePanel.call(this, Y);

    this.colDataUrl = "./sqliteservices/getcols";
    this.tableDataUrl = "./sqliteservices/getdata";
    this.deleteRowsUrl = "./sqliteservices/deleterows";
    this.updateUrl = "./sqliteservices/updaterow";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
SqliteDatatablePanel.prototype = Object.create(BasicDatabaseDatatablePanel.prototype);

/*
 *
 * Init Function
 *
 */
SqliteDatatablePanel.prototype.init = function(cb) {
    if(typeof this.tableName !== "undefined" && this.tableName) {
        BasicDatabaseDatatablePanel.prototype.init.call(this, function(){
            if(typeof cb !== "undefined") {
                cb();
            }
        });
    }

};

SqliteDatatablePanel.prototype.getColumnData = function(callback) {
    var that = this;
    this.doAjaxJSONCall(
        this.colDataUrl,
        {
            table: this.tableName,
            dataType: this.dataType,
            initData: JSON.stringify(this.tableInitData)
        },
        function(colData){
            if(typeof colData.error !== "undefined") {
                return console.log('error:', colData);
            }
            that.auto_increment = colData.data.auto_increment || '';
            callback(that.enhanceTableColumns(colData.data));
        }
    );
};

SqliteDatatablePanel.prototype.getTableData = function(callback, limits) {
    var that = this;
    limits = limits || this.queryLimits;
    this.doAjaxJSONCall(
        this.tableDataUrl,
        {
            table: this.tableName,
            limits: JSON.stringify(limits),
            repopulate: 1,
            dataType: this.dataType,
            initData: JSON.stringify(this.tableInitData)
        },
        function(tableData) {
            callback(that.createModelList(tableData.data));
        }
    );
    /*
    $.ajax({
        url: this.tableDataUrl,
        type: "POST",
        dataType: "json",
        data: "table=" + this.tableName + "&limits=" + JSON.stringify(limits),
        success: function(tableData) {
            callback(that.createModelList(tableData.data));
        }
    });
    */
};
