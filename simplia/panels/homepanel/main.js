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
function HomePanel(Y, properties) {
    //Calling base constructor
    MogopakViewerPanel.call(this, Y);

    //Default title
    this.panelTitle = "User Homepage";
    this.ODEUsernamePanelName = "odeusername";

    if (typeof properties === "object") {
        $.extend(this, properties);
        if (typeof properties.template === "object") {
            $.extend(this, properties.template);
        }
    }
    this.mogopakUrl = this.Params.mogopakUrl;
}

//Inheriting from the base object
HomePanel.prototype = Object.create(MogopakViewerPanel.prototype);

/**
 * Essential init function that should always be called by the panel loader utility. Also, it's imperative to call the base class (which may not be MogopakViewerPanel always) init function in it
 * @param cb
 */
HomePanel.prototype.init = function (cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    MogopakViewerPanel.prototype.init.call(this, function () {
        if (typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 *
 */
HomePanel.prototype.setupRightMenu = function () {
    //Always call the base class's function
    MogopakViewerPanel.prototype.setupRightMenu.call(this);

    this._addSimplePanelPermission();
    this.openSamplePanel();
    // =============================================
    this._addLogoutOption();
    this._addGrantODEOption();
    this._addDynamodbQueryOption();

};

HomePanel.prototype.setupLeftMenu = function () {
    BasicPanel.prototype.setupLeftMenu.call(this);

    this.setLeftMenuData(this.leftMenu);
};

HomePanel.prototype._addLogoutOption = function () {
    var that = this;
    this.addRightMenuItem("Logout", function () {
        Cookies.remove(
            that.Y.oxygenConfig.cookies.names.sessionId,
            {
                path: that.Y.oxygenConfig.cookies.data.path,
                domain: that.Y.oxygenConfig.cookies.data.domain
            }
        );
        window.location.reload();
    });
};

HomePanel.prototype._addDynamodbQueryOption = function () {
    var that = this;
    this.addRightMenuItem("Dynamodb Query", function () {
        that.sendComponentData(
            that.accountItem.Type,
            that.accountItem.Node,
            "relayServerTip",
            {
                command: "openDynamodbViewer",
                roleInObject: that.roleInObject,
                roleInThread: that.roleInThread,
                threadId: that.threadItem.Node,
                accountId: that.accountItem.Node
            },
            function (data) {
                if (typeof data.error !== "undefined" && data.error) {
                    return console.log('error:', data.errorInfo);
                }
                if (typeof data.panelName !== "undefined") {
                    that.openPanel({}, function () {
                    }, data.panelName);
                }
                else {
                    that.openPanel(data, function () {

                    }, data.initData.panelName);
                }
            }
        );
    });
};

HomePanel.prototype._addGrantODEOption = function () {
    var that = this;
    this.addRightMenuItem("Grant ODE", function () {
        var panel;
        if (!(panel = that.childPanel(that.ODEUsernamePanelName))) {
            var formData = [];

            formData.push([{type: 'text', value: "Username"}, {type: "textbox", value: ''}]);
            formData.push([{type: 'text', value: "Grant"}, {
                type: "button", name: "grant", callback: function () {
                    that._grantODE();
                }
            }]);

            that.createChildFormPanel(that.ODEUsernamePanelName, "Grant ODE Permission", formData, function (error, panel) {
                if (error) {
                    return console.log('error:', error);
                }
                panel.showPanel();
            });
        }
        else {
            panel.showPanel();
        }
    });
}

HomePanel.prototype._grantODE = function () {
    var panel = this.childPanel(this.ODEUsernamePanelName);
    var formData = panel.collectFormData();
    var that = this;

    this.sendComponentData(
        this.typeNodeId,
        this.serverNodeId,
        "relayServerTip",
        {
            command: "grantODE",
            accountName: formData['Username']
        },
        function (data) {
            if (typeof data.error !== "undefined" && data.error) {
                return console.log('Error:', data.errorInfo);
            }
            that.setLeftMenuData(that.leftMenu);
        }
    )
};

HomePanel.prototype._addSimplePanelPermission = function () {
    var that = this;
    this.addRightMenuItem("Add Panel Permission", function () {
        that.sendComponentData(
            //that.typeNodeId,
            //that.serverNodeId,
            that.Y.oxygenConfig.nodeIds.types.samplepanel.server,
            that.Y.oxygenConfig.nodeIds.tips.samplepanel,
            "relayServerTip",
            {
                command: "setPanelPermission"
            },
            function (data) {
                if (typeof data.error !== "undefined" && data.error) {
                    return console.log('Error:', data.errorInfo);
                }
                that.setLeftMenuData(that.leftMenu);
            }
        )
    });
};


HomePanel.prototype.openSamplePanel = function () {
    var that = this;
    this.addRightMenuItem("Open Simple Panel", function () {
        that.sendComponentData(
            that.accountItem.Type,
            that.accountItem.Node,
            "relayServerTip",
            {
                command: "openSimplePanel",
                roleInObject: that.roleInObject,
                roleInThread: that.roleInThread,
                threadId: that.threadItem.Node,
                accountId: that.accountItem.Node
            },
            function (data) {
                if (typeof data.error !== "undefined" && data.error) {
                    return console.log('error:', data.errorInfo);
                }
                if (typeof data.panelName !== "undefined") {
                    that.openPanel({}, function () {
                    }, data.panelName);
                }
                else {
                    that.openPanel(data, function () {
                    }, data.initData.panelName);
                }
            }
        );
    });
};

