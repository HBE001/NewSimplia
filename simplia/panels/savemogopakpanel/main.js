/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * � 2010-2015 Lotus Interworks Inc. (�LIW�) Proprietary and Trade Secret.
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
function SaveMogopakPanel(Y, properties) {
    //Calling base constructor
    BasicFormDatatablePanel.call(this, Y);

    //Default title
    this.panelTitle = "Save";
    this.mainMogopakFolder = "Mogopaks";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
SaveMogopakPanel.prototype = Object.create(BasicFormDatatablePanel.prototype);

/**
 *
 * @param cb
 */
SaveMogopakPanel.prototype.init = function(cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    var that = this;
    BasicFormDatatablePanel.prototype.init.call(this, function(){
        if(typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 *
 */
SaveMogopakPanel.prototype.setupRightMenu = function() {
    //Always call the base class's function
    BasicFormDatatablePanel.prototype.setupRightMenu.call(this);
};

/**
 *
 * @param callback
 */
SaveMogopakPanel.prototype.getTableData = function(callback) {
    var that = this;

    var tableData = [];
    tableData.push(this.addTableDataRow({type: 'text', value: "Project Name"}, {type: "textbox", value:''}));
    tableData.push(this.addTableDataRow({type: 'text', value: "Page Number"}, {type: "textbox", value:''}));
    tableData.push(this.addTableDataRow({type: 'text', value: "Save"}, {type: "button", name: "Save", callback: function(){ that._save();}}));
    callback(tableData);

};

SaveMogopakPanel.prototype._save = function() {
    var that = this;

    var saveData = {command: "savemogopakpage", role: this.role, data: this.collectFormData()};
    this.doAjaxJSONCall("./" + this.typeNodeId + "/" + this.serverNodeId, {command: "relayServerTip", data: JSON.stringify(saveData)}, function(data){
        if(data.error) {
            //that._setStatus(data.errorInfo);
            console.log('Error:', data.errorInfo);
        }
        else {
            //that._setStatus(da);
            $.ajax({
                url: data.url,
                type: 'PUT',
                contentType: data.contentType,
                //data: tinyMCE.activeEditor.getContent({format : 'raw'}),
                data: tinyMCE.activeEditor.getContent(),
                success: function() {
                    var params = {
                        id: data.id,
                        displayName: data.mogopakName,
                        roleInObject: that.parentPanel.roleInObject,
                        roleInThread: that.parentPanel.roleInThread,
                        parentList: [that.mainMogopakFolder, data.mogopakName],
                        info: {
                            accountItem: that.parentPanel.accountItem,
                            threadItem: that.parentPanel.threadItem,
                            grants: 1
                        }
                    };
                    that.addNewPermission(params, function(data){
                        that.hidePanel();
                    });

                }
            });

        }
    });
};

