/** * Fetches the column data for the datatable. The function must be overloaded by the derived oxygen component. * And must return data as part of the callback in the specified format. * @param {columnDataCallback} callback */
JSONFormatter.prototype.getTableColumns = function (JSONSchema, callback) {
    var that = this;
    var tableColumns = [];
    for (var i = 0; i < JSONSchema.YUIDatatable.Settings.columns.length; i++) {
        tableColumns.push(JSONSchema.YUIDatatable.Settings.columns[i]);
        tableColumns[i].formatter = eval(JSONSchema.YUIDatatable.Settings.columns[i].formatter);
    }
    return callback(tableColumns);
};

/** * The column data callback * * @callback columnDataCallback * @param {Object} colData - Column Data to be used by the datatable * @param {Array} colData.columns - Array of columns names or YUI 3 Datatable column specification object. * For further reference, check YUI3 Datatable documentation * @param {Array} colData.primaryKeys = Array of column names that will be used as primary keys for checkbox module. * Only one column name may suffice. */
JSONFormatter.prototype.getTableData = function (JSONSchema, callback) {
    var that = this;
    var tableData = [];
    var tipValuesArrays = this.getTipValuesArrays();
    for (var i = 0; i < JSONSchema.YUIDatatable.Settings.data.length; i++) {
        Object.keys(JSONSchema.YUIDatatable.Settings.data[i]).forEach(function (key) {
            var modifiedKey = ( key == "Input" || key == "Role" || key == "Current_State" ? "Select_" + key : key == "Save_Button" ? "Run_State" : key);
            tableData.push(that.addTableDataRow({type: 'text-field', value: modifiedKey}, {
                type: "text",
                value: (modifiedKey == "Run_State" ? "Run_State" : "" ),
                specialValue: (modifiedKey == "Run_State" ? true : false)
            }, {
                type: (that.parent.widgetsContainer.tagArray[modifiedKey] == undefined ? "button" : ( modifiedKey == "Select_Input" || modifiedKey == "Select_Role" || modifiedKey == "Select_Current_State" || modifiedKey == "Run_State" ? that.parent.widgetsContainer.tagArray[modifiedKey] : "button")),
                value: (modifiedKey == "Select_Input" ? tipValuesArrays.inputArray : modifiedKey == "Select_Role" ? tipValuesArrays.rolesArray : modifiedKey == "Select_Current_State" ? tipValuesArrays.statesArray : modifiedKey == "Run_State" ? "Run_State" : "" ),
                specialValue: (modifiedKey == "Run_State" ? true : false)
            }, modifiedKey));
        });
    }
    return callback(tableData);
};

JSONFormatter.prototype.getTipValuesArrays = function () {
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
    var currentState = Object.keys(statesArray)[0];
    var currentRole = Object.keys(rolesArray)[0];
    if (this.parent.targetedContent.roleStateJSON.RoleState[currentRole] !== undefined && this.parent.targetedContent.roleStateJSON.RoleState[currentRole][currentState] != undefined) {
        this.parent.targetedContent.roleStateJSON['RoleState'][currentRole][currentState].forEach(function (value) {
            inputArray[value] = value;
        });
    }
    return {statesArray: statesArray, rolesArray: rolesArray, inputArray: inputArray}
}