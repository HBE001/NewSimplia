/**
 * Created by Imad on 5/4/2015.
 *
 */
function MysqlDatatablePanel(Y, properties) {
    //Calling base constructor
    BasicDatabaseDatatablePanel.call(this, Y);

    this.colDataUrl = "./datatableservices/getcols";
    this.tableDataUrl = "./datatableservices/getdata";
    this.deleteRowsUrl = "./datatableservices/deleterows";
    this.updateUrl = "./datatableservices/updaterow";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
MysqlDatatablePanel.prototype = Object.create(BasicDatabaseDatatablePanel.prototype);

/*
 *
 * Init Function
 *
 */
MysqlDatatablePanel.prototype.init = function(cb) {
    if(typeof this.tableName !== "undefined" && this.tableName) {
        var that = this;
        BasicDatabaseDatatablePanel.prototype.init.call(this, function(){
            //that.addRightMenuHandlers();
            if(typeof cb !== "undefined") {
                cb();
            }
        });
    }

};