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
function HomepagePanel(Y, properties) {
    //Calling base constructor
    MogopakViewerPanel.call(this, Y);

    //Default title
    this.panelTitle = "Homepage";

    this.oxygenComponentPanelName = "oxygencomponentpanel";
    this.oxygenComponentPanelType = "dyndbinputformpanel";

    this.oxyCompTypesPanelName = "oxygencomponentpanel";
    this.oxyCompTypesPanelType = "sqlitedatatablepanel";


    if(typeof properties === "object") {
        $.extend(this, properties);
        if(typeof properties.template === "object") {
            $.extend(this, properties.template);
        }
    }
}

//Inheriting from the base object
HomepagePanel.prototype = Object.create(MogopakViewerPanel.prototype);

/**
 * Essential init function that should always be called by the panel loader utility. Also, it's imperative to call the base class (which may not be MogopakViewerPanel always) init function in it
 * @param cb
 */
HomepagePanel.prototype.init = function(cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    MogopakViewerPanel.prototype.init.call(this, function(){
        if(typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 *
 */
HomepagePanel.prototype.setupRightMenu = function() {
    //Always call the base class's function
    BasicPanel.prototype.setupRightMenu.call(this);

    var that = this;
    this._getOperations(function(){
        that._addViewOxygenComponentMetatypesOption('RootTemplate');
        that._addViewOxygenComponentMetatypesOption('Type');
        that._addCreateOxygenComponentOption();

    });
};

HomepagePanel.prototype._getOperations = function(callback) {
    var that = this;
    this.doAjaxJSONCall(
        './' + this.typeNodeId + '/' + this.serverNodeId,
        {
            command: "relayServerTip",
            data: JSON.stringify(
                {
                    command: "getOperations",
                    threadId: this.threadItem.Node,
                    roleInObject: this.roleInObject,
                    roleInThread: this.roleInThread
                }
            )
        },
        function(data) {
            if((typeof data.error !== "undefined") && data.error) {
                return console.log('error:', data);
            }
            data.forEach(function(operation) {
                that.addRightMenuItem(operation, function(){
                    that.sendComponentData(
                        that.typeNodeId,
                        that.serverNodeId,
                        "relayServerTip",
                        {
                            command: "doOperation",
                            operation: operation,
                            roleInObject: that.roleInObject,
                            roleInThread: that.roleInThread
                        },
                        function(opData) {
                            var panelName = opData.panel;
                            if(typeof that.childPanel(panelName) === "undefined") {
                                that.addChildPanel(
                                    panelName,
                                    panelName,
                                    {
                                        typeNodeId: that.typeNodeId,
                                        serverNodeId: that.serverNodeId,
                                        roleInObject: that.roleInObject,
                                        roleInThread: that.roleInThread
                                    },
                                    function(error, panel) {
                                        if (error) {
                                            console.log('Error:', error);
                                        }
                                        panel.showPanel();
                                    }
                                );
                            }
                            else {
                                that.childPanel(panelName).showPanel();
                            }
                        }
                    );
                });
            });
            callback();
        }
    );
};

HomepagePanel.prototype.doOperation = function(operation, opData) {
    console.log('operation:',operation, ' - opData:', opData);
};

HomepagePanel.prototype._addViewOxygenComponentMetatypesOption = function(metaType) {
    var that = this;

    this.addRightMenuItem("View Oxygen Component "+ metaType + "s", function() {
        var cPanel = {};
        if(cPanel = that.childPanel(that.oxyCompTypesPanelName)) {
            cPanel.resetPanel();
            cPanel.showPanel();
        }
        else {
            var properties = {tableName: "OxygenComponents", dataType: "scan", tableInitData: {scanType: 'AND', filterData: [{name: 'MetaType', op: '=', value: metaType}]}};
            that.addChildPanel(that.oxyCompTypesPanelType, that.oxyCompTypesPanelName, properties, function(error, panel){
                if(error)  {
                    return console.log('error:', error);
                }
                panel.showPanel();
            })
        }

    });
};

HomepagePanel.prototype._addCreateOxygenComponentOption = function() {
    var that = this;

    this.addRightMenuItem("Create Oxygen Component", function(){
        var cPanel = {};
        if(cPanel = that.childPanel(that.oxygenComponentPanelName)) {
            cPanel.resetPanel();
            cPanel.showPanel();
        }
        else {
            var properties = {tableName: that.Y.oxygenConfig.dynamodb.tables.components.tableName, updateTime: that.Y.oxygenConfig.dynamodb.tables.components.metatdataUpdateTime};
            that.addChildPanel(that.oxygenComponentPanelType, that.oxygenComponentPanelName, properties, function(error, panel){
                if(error)  {
                    return console.log('error:', error);
                }
                panel.showPanel();
            })
        }
    });
};