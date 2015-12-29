var JSONFormatter = function (parent) {
    this.parent = parent;
};

/**
 * Returns proper settign schema to build the YUI DataTable
 * @returns {Array} Array of YUI3 Model
 */
JSONFormatter.prototype.transformSchema = function (JSONSchema, callback) {
    var that = this;
    this.getTableColumns(JSONSchema, function (tableColumns) {
        that.getTableData(JSONSchema, function (tableData) {
            var formattedSchema = $.extend({}, JSONSchema.YUIDatatable.Settings, {
                columns: tableColumns,
                data: tableData,
                srcNode: eval(JSONSchema.YUIDatatable.Settings.srcNode)
            });
            console.log("Returned Transform Schema = ");
            console.log(formattedSchema);
            callback(formattedSchema);
        });
    });
};

/**
 * Fetches the column data for the datatable. The function must be overloaded by the derived oxygen component.
 * And must return data as part of the callback in the specified format.
 * @param {columnDataCallback} callback
 */
JSONFormatter.prototype.getTableColumns = function (JSONSchema, callback) {

};

/**
 * The column data callback
 *
 * @callback columnDataCallback
 * @param {Object} colData - Column Data to be used by the datatable
 * @param {Array} colData.columns - Array of columns names or YUI 3 Datatable column specification object.
 * For further reference, check YUI3 Datatable documentation
 * @param {Array} colData.primaryKeys = Array of column names that will be used as primary keys for checkbox module.
 * Only one column name may suffice.
 */
JSONFormatter.prototype.getTableData = function (JSONSchema, callback) {

};

// format the supplied values in proper json formate so we can pass easly to the YUI dataTable
JSONFormatter.prototype.addTableDataRow = function (name, value, menu, id) {
    return {
        id: id ||"undefined",
        customId: (typeof id !== "undefined"),
        Name: name,
        Value: value,
        Menu: menu
    };
};

