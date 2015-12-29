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

function ScreenManager(Y, config) {
    //Initialization code
    this.Y = Y;
    this.panelInstances = {};
    this.panels = {};
    this.panelsArray = [];
    this.panelsIndex = {};
    this.pLoader = new PanelLoader(this.Y);
    this.initialZIndex = 1;
    this.panelsParentDiv = "panels";
    this.focusedPanel = "";
    this.tabs = {};
    this.tabCount = 0;
    this.baseTabIndex = "";
    this.lastCreatedTabIndex = ""

    this.nextPanelCoords = [0, 0];

    if (typeof config === "object") {
        $.extend(this, config);
    }
}

ScreenManager.prototype.init = function (mCallback) {
    //Create the base tab - home of initial setup
    var that = this;
    async.waterfall([
        function (callback) {
            that.createTab(function (error, tabNum) {
                if (error) {
                    return callback(error);
                }
                that.baseTabIndex = tabNum;
                callback();
            });
        }
    ], mCallback);
};

ScreenManager.prototype.getNextZIndex = function () {
    return this.initialZIndex++;
};

ScreenManager.prototype.addPanelInstance = function (instanceId, panel) {
    this.panelInstances[instanceId] = panel;
};

ScreenManager.prototype.getPanelInstance = function (instanceId) {
    return this.panelInstances[instanceId] || null;
};

ScreenManager.prototype.addPanel = function (panel) {
    var panelId = panel.getPanelId();
    this.panels[panelId] = panel;
    this.panelsIndex[panelId] = this.panelsArray.push(panelId) - 1;

};

ScreenManager.prototype.getPanel = function (panelName) {
    return this.panels[panelName] || null;
};

ScreenManager.prototype.hidePanels = function () {
    for (var panelName in this.panels) {
        this.panels[panelName].visible = this.panels[panelName].panel.panel.get('visible');
        this.panels[panelName].xy = this.panels[panelName].panel.panel.get('xy');
        this.panels[panelName].panel.panel.hide();
    }
};

ScreenManager.prototype.showPanels = function () {
    for (var panelName in this.panels) {
        if (this.panels[panelName].visible) {
            this.panels[panelName].panel.panel.show();
            this.panels[panelName].panel.panel.move(this.panels[panelName].xy[0], this.panels[panelName].xy[1]);
        }
    }
};


ScreenManager.prototype.maximizePanels = function () {
    for (var panelName in this.panels) {
        var panelContainerName = this.panels[panelName].container;
        this.panels[panelName].panel.maximizePanel();
    }
};

ScreenManager.prototype.minimizePanels = function () {
    for (var panelName in this.panels) {
        var panelContainerName = this.panels[panelName].container;
        this.panels[panelName].panel.minimizePanel();
    }
};

ScreenManager.prototype.getMousePosition = function (e) {
    var _x;
    var _y;
    var isIE = document.all ? true : false;

    if (!isIE) {
        _x = e.pageX;
        _y = e.pageY;
    }
    if (isIE) {
        _x = event.clientX + document.body.scrollLeft;
        _y = event.clientY + document.body.scrollTop;
    }
    return [_x, _y];
};

ScreenManager.prototype.stackPanels = function (topPos) {
    for (var panelName in this.panels) {
        if (this.panels[panelName].panel.panel.get('visible')) {

            this.panels[panelName].panel.panel.move(0, topPos);

            var panelContainerName = this.panels[panelName].container;
            this.panels[panelName].panel.minimizePanel();
            var panelHeaderHeight = $("#" + panelContainerName).find('.header-title').parent().height();
            topPos += panelHeaderHeight;
        }
    }

};


ScreenManager.prototype.initializePanel = function (panelName, properties, callback) {
    var that = this;
    this.pLoader.initializePanel(panelName, properties, function (error, panel) {
        if (error) {
            return callback(error);
        }
        panel.init(function () {
            that.addPanel(panel);
            that.alignNewPanel(panel);
            callback(error, panel);
        });
    });
};

ScreenManager.prototype.alignNewPanel = function (panelObj) {
    /*
     panel.callPanel("set","xy",this.nextPanelCoords);
     var panelElem = $('#' + panel.getPanelId());

     this.nextPanelCoords[0] = panelElem.offset().left + panelElem.width();
     */
    panelObj.panel.align(null, [this.Y.WidgetPositionAlign.TC, this.Y.WidgetPositionAlign.TC]);
};

ScreenManager.prototype.showPanel = function (panelName) {
    var panelObj;
    if (panelObj = this.getPanel(panelName)) {
        panelObj.panel.showPanel();
    }
    else {
        this.initializePanel(panelName, true);
    }
};

ScreenManager.prototype.getPanelsParentDiv = function () {
    return this.Y.one('#' + this.panelsParentDiv);
};

ScreenManager.prototype.initializeScreen = function (callback) {
    var accountId = Cookies.get(this.Y.oxygenConfig.cookies.names.userId);
    var sessionId = Cookies.get(this.Y.oxygenConfig.cookies.names.sessionId);

    if (accountId) {
        if (sessionId) {
            this.initializeRegisteredSession(sessionId, callback);
        }
        else {
            this.initializeAnonymousSession(accountId, callback);
        }
    } else {
        this.initializeAnonymousSession("2015-12-15T23:31:29.209056Z000-0000Z", callback);
    }
};

ScreenManager.prototype.initializeAnonymousSession = function (accountId, mCallback) {
    var that = this;

    async.waterfall([
        function (callback) {
            that.sendComponentData(
                that.Y.oxygenConfig.nodeIds.types.anonymousaccount.server,
                "none",
                "getClientTipData",
                {
                    serverNodeId: accountId
                },
                function (data) {
                    callback(data.errorInfo || null, data);
                }
            );
        }, function (data, callback) {
            that.initializePanel(data.panelType, data.initData, function (error, panel) {
                callback(error, data, panel);
            });
        }, function (data, panel, callback) {
            that.addPanelInstance(data.initData.clientNodeId, panel);
            panel.showPanel();
            callback();
        }
    ], mCallback);
};

ScreenManager.prototype.initializeRegisteredSession = function (sessionId, mCallback) {
    var that = this;

    async.waterfall([
        function (callback) {
            that.sendComponentData(
                that.Y.oxygenConfig.nodeIds.types.registeredaccount.server,
                "none",
                "resetActiveSession",
                {
                    sessionId: sessionId
                },
                function (data) {
                    callback(data.errorInfo || null);
                }
            );
        }, function (callback) {
            that.sendComponentData(
                that.Y.oxygenConfig.nodeIds.types.registeredaccount.server,
                "none",
                "getClientTipData",
                {
                    sessionId: sessionId
                },
                function (data) {
                    callback(data.errorInfo || null, data);
                }
            );
        }, function (data, callback) {
            that.initializePanel(data.panelType, data.initData, function (error, panel) {
                callback(error, data, panel);
            });
        }, function (data, panel, callback) {
            that.addPanelInstance(data.initData.clientNodeId, panel);
            panel.showPanel();
            callback();
        }
    ], mCallback);
};

ScreenManager.prototype.doAjaxJSONCall = function (url, data, callback, method) {
    $.ajax({
        url: url,
        type: method || "POST",
        dataType: "json",
        data: data,
        success: callback
    });
};

ScreenManager.prototype.sendComponentData = function (typeId, serverNodeId, command, commandData, callback, method) {
    var url = "./" + typeId + "/" + serverNodeId;
    var data = {
        command: command,
        data: JSON.stringify(commandData)
    };

    this.doAjaxJSONCall(
        url,
        data,
        callback,
        method || "POST"
    );
};

ScreenManager.prototype.getGUID = function (callback) {
    this.sendComponentData(
        this.Y.oxygenConfig.nodeIds.types.anonymousthread.server,
        "none",
        "getGUID",
        {},
        function (data) {
            if (data.error) {
                console.log('error:', data.errorInfo);
            }
            callback(data.errorInfo || null, data.guid || null);
        }
    );
};

ScreenManager.prototype.createTab = function (mCallback) {
    var that = this;
    var tabNum = that.tabCount++;

    async.waterfall([
        function (callback) {
            var properties = {
                tabNum: tabNum
            };
            that.tabs[tabNum] = new OxygenTab(that.Y, properties);
            that.tabs[tabNum].init(callback);
        }
    ], function (error) {
        mCallback(error, tabNum);
    });
};

ScreenManager.prototype.getBaseTab = function () {
    return this.tabs[this.baseTabIndex];
};

ScreenManager.prototype.getBaseTabIndex = function () {
    return this.baseTabIndex;
};

ScreenManager.prototype.getTab = function (index) {
    return this.tabs[index];
};

ScreenManager.prototype.getLastCreatedTabIndex = function () {
    if (this.tabCount > 1) {
        return (this.tabCount - 1);
    }
    return null;
};