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
 * Basic Panel is the main base class to be used for creating other panels
 * @param {object} Y - Global YUI Object
 * @constructor
 */
function BasicPanel(Y) {
    //Calling base constructor
    BasicContainer.call(this, Y);

    this.container = {};
    this.panel = {};
    this.mainPanelEvent = "panelevent";
    this.rightMenu = "";
    this.leftMenu = "";
    this.checkboxMenu = "";
    this.selectedRecord = "";
    this.shareEventHandler = "";
    this.acceptPanelEvents = false;
    this.panelTitle = "";
    this.panelEvent = "";
    this.simpleDialog = "";
    this.bodyContent = "";

    this.panelAlignSelector = "";
    this.panelAlignCoords = "";

    this.formPanelType = "basicformdatatablepanel";
    this.oxygenLinkClass = "oxygenlink";

    this.headerTitleSpanHtml = '<span class="panel-title">{{title}}&nbsp;-&nbsp;Tab({{tabNum}})</span>';

    this.headerTemplateHtml = '<div class="header-title"><span class="alignleft"><span class="alignleft mainpanel_option checklistmenuleft">&#9776;&nbsp;&nbsp;</span></span><span>' +
        this.headerTitleSpanHtml + '</span><span class="alignleft"></span><span class="alignleft mainpanel_option"><span class="arrow">' +
        '<span class="arrowup" style="display:none;">&#9650;</span><span class="arrowdown">&#9660;</span></span></span>' +
        '<span class="panelsalignright checklistmenuright">&#9776;</span></div>';


    this.headerTemplate = this.Y.Handlebars.compile(this.headerTemplateHtml);
    this.headerTitleTemplate = this.Y.Handlebars.compile(this.headerTitleSpanHtml);
}

//Inheriting from the base object
BasicPanel.prototype = Object.create(BasicContainer.prototype);

/**
 * Init is the first function that ought to be executed
 * @param {function} callback - Callback function
 */
BasicPanel.prototype.init = function (callback) {
    var that = this;
    BasicContainer.prototype.init.call(this, function () {
        that._setInitParams();
        that._createMainPanel();
        that._createMenus();
        that._setupMainPanelEventHandlers();
        //this._setupEventHandlers();
        that._setupEvents();
        that._createSimpleDialog();
        if (typeof callback !== "undefined") {
            callback();
            that.panel.align(null, [that.Y.WidgetPositionAlign.TC, that.Y.WidgetPositionAlign.TC]);
        }
    });
};

BasicPanel.prototype._setInitParams = function () {
    if (!this.isChildPanel()) {
        if (typeof this.parentTab === "undefined") {
            this.parentTab = this.Y.screenManager.getBaseTab();
        }
    }
};

BasicPanel.prototype.isChildPanel = function () {
    return (typeof this.parentPanel !== "undefined");
};

/**
 * Main function that's used to create the panel
 * @private
 */
BasicPanel.prototype._createMainPanel = function () {
    this.container = this.panel = new this.Y.Panel({
        headerContent: this.headerTemplate({title: this.panelTitle, tabNum: this.parentTab.getTabNum()}),
        bodyContent: "",
        zIndex: this.Y.screenManager.getNextZIndex(),
        modal: false,
        visible: false,
        centered: false,
        render: false,
        buttons: []
    });

    this.panel.plug(this.Y.Plugin.Drag, {
        handles: [
            '.yui3-widget-hd'
        ]
    });

    var parentDiv = this.Y.screenManager.getPanelsParentDiv();
    if (this.isChildPanel()) {
        parentDiv = '#' + this.parentPanel.getPanelId();
    }

    this.panel.render(parentDiv);

    //$('#' + this.getPanelId()).attr('tabindex', '-1');

    //Adding the CSS class to enable the header to take up all the available space as there is no close button
    $('#' + this.panel.get('boundingBox').get('id') + ' .yui3-widget-hd').addClass('simplia-panel-header');

    if (this.bodyContent) {
        this.panel.set('bodyContent', this.bodyContent);
    }

    if (typeof this.panelWidth !== "undefined" && this.panelWidth) {
        this.panel.set('width', this.panelWidth);
    }

    if (typeof this.panelHeight !== "undefined" && this.panelHeight) {
        this.panel.set('height', this.panelHeight);
    }
};

/**
 * Sets up the panel related event handlers
 * @private
 */
BasicPanel.prototype._setupMainPanelEventHandlers = function () {
    this._setupVisisbleChangeListener();
    this._setupFocusedChangeListener();
    this._setupClickListener();
};

BasicPanel.prototype._setupVisisbleChangeListener = function () {
    this.panel.after("visibleChange", function (e) {
        if (!e.newVal) {
            Object.keys(this.childPanels).forEach(function (panelName) {
                this[panelName].hidePanel();
            }, this.childPanels);
            this.leftMenu.hideMenu();
            this.rightMenu.hideMenu();
        }
    }, this);
};

BasicPanel.prototype._setupFocusedChangeListener = function () {
    this.panel.after("focusedChange", function (e) {
        if (!this.isChildPanel()) {
            if (e.newVal) {
                //console.log('focusedPanel:', this.Y.screenManager.focusedPanel);
                if (this.Y.screenManager.focusedPanel) {
                    this.bringToTop(this.Y.screenManager.focusedPanel);
                    this.Y.screenManager.focusedPanel._lostFocusHandler();
                }
                this._gainFocusHandler();
            }
            else {
                //console.log('panel lost focus:', that.panelTitle);
            }
        }
    }, this);
};

BasicPanel.prototype._setupClickListener = function () {
    this.panel.on('click', function (e) {
        if (!this.isChildPanel() && this.getPanelId() !== this.Y.screenManager.focusedPanel.getPanelId()) {
            this.panel.focus();
        }
        //that.checkClickEvent(e);
    }, this);

    var that = this;

    this.Y.one('#' + this.getPanelId()).delegate('click', function (e) {
        //e.preventDefault();
        //e.stopPropagation();
        //that.oxygenClickEvent(e);
        var elem = e.currentTarget.getDOMNode();
        console.log('elem:', elem);
        if (!$(this).data('oldonclick')) {
            $(this).data('oldonclick', elem.getAttribute('onclick'));
            //$(elem).prop('onclick',null).off('click');
            $(elem).removeAttr('onclick');
            //elem.onclick = null;
            console.log('after:', elem);
        }
        that.oxygenClickEvent(this, e);
        e.stopPropagation();
        return false;
    }, '.oxygenlink');
    /*
     $('#' + this.getPanelId() + ' .' + this.oxygenLinkClass).each(function(){
     $(this).data('onclick', this.onclick);

     this.onclick = function(event) {
     that.oxygenClickEvent(event);
     return false;
     };
     });
     */
};

BasicPanel.prototype._lostFocusHandler = function () {
    this.panel.blur();

    this.leftMenu.hideMenu();
    this.rightMenu.hideMenu();

    if ((typeof this.accountItem !== "undefined") && (typeof this.sessionItem !== "undefined")) {
        this.updatePanelStatus('Open');
    }
    this.Y.screenManager.focusedPanel = "";
};

BasicPanel.prototype._gainFocusHandler = function () {
    this.Y.screenManager.focusedPanel = this;

    var that = this;

    if ((typeof this.accountItem !== "undefined") && (typeof this.sessionItem !== "undefined")) {
        this.updatePanelStatus('InFocus');
    }
};

BasicPanel.prototype.updatePanelStatus = function (status) {
    var that = this;
    this.sendComponentData(
        this.threadItem.Type,
        'none',
        'updateSessionSpokes',
        {
            spokeId: this.spokeId || "",
            panelStatus: status,
            accountId: this.accountItem.Node,
            sessionId: this.sessionItem.Node,
            threadId: this.threadItem.Node,
            objectId: this.serverNodeId,
            viewId: this.clientNodeId,
            tabId: this.parentTab.getTabId()
        },
        function (data) {
            if (data.error) {
                return console.log('error:', data.errorInfo);
            }
            that.spokeId = data.data.Node;
        }
    )

};

/**
 * Sets up the custom event handlers
 * @private
 */
BasicPanel.prototype._setupEventHandlers = function () {
    var that = this;
    this.Y.on(this.messageEvent, function (data) {
        if (that.acceptPanelEvents) {
            that.handlePanelSharingEvent(data);
        }
    });
};


/**
 * Returns the mouse position of the event
 * @param {Event} e - Event
 * @returns {Array} Array containing the x,y location
 */
BasicPanel.prototype.getEventMousePosition = function (e) {
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

/**
 * Minimizes the panel in a state where only the header is visible
 */
BasicPanel.prototype.minimizePanel = function () {
    var panelId = this.panel.get('srcNode').getAttribute('id');
    var panelElem = $('#' + panelId);
    panelElem.find('.yui3-widget-bd').hide();

    if (panelElem.find('.arrowdown').is(':visible')) {
        panelElem.find('.arrowup').toggle();
        panelElem.find('.arrowdown').toggle();
    }
};

/**
 * Restores the panel to its original state
 */
BasicPanel.prototype.maximizePanel = function () {
    var panelId = this.panel.get('srcNode').getAttribute('id');
    var panelElem = $('#' + panelId);
    panelElem.find('.yui3-widget-bd').show();

    if (panelElem.find('.arrowup').is(':visible')) {
        panelElem.find('.arrowup').toggle();
        panelElem.find('.arrowdown').toggle();
    }
};

/**
 * Creates the left Menu
 * @private
 */
BasicPanel.prototype._createLeftMenu = function () {
    this.leftMenu = new LeftMenu(this.Y, {parentPanel: this, parentTab: this.parentTab});
    this.leftMenu.init();
};

/**
 * Default handler for left menu tree clicks; it sends the click node information to its respective server-side component via the thread component. In case a different result is needed, it can be overloaded
 * @param {Event} event - Jquery Event object
 * @param {EventData} data - Details of this object are available through Fancytree documentation (http://wwwendt.de/tech/fancytree/doc/jsdoc/global.html#EventData)
 */

BasicPanel.prototype.handleLeftMenuTreeClick = function (event, data) {
    var that = this;
    this.sendComponentData(
        this.threadItem.Type,
        this.threadItem.Node,
        'leftMenuClick',
        {
            nodeId: data.node.key, threadId: this.threadItem.Node, accountId: this.accountItem.Node, role: this.role
        },
        function (data) {
            if ((typeof data.error !== "undefined") && data.error) {
                return console.log('error:', data.errorData);
            }
            var returnType = {
                'panel': that.openPanel.bind(that)
            };
            returnType[data.returnType](data);
            that.leftMenu.hideMenu();
        }
    );
};

/**
 * Creates the right menu
 * @private
 */

BasicPanel.prototype._createRightMenu = function () {
    this.rightMenu = new RightMenu(this.Y, {parentPanel: this, parentTab: this.parentTab});
    this.rightMenu.init();
};

/**
 * Wrapper function for Panel class to add right menu items
 * @param {string} menuLabel
 * @param {Function} callback
 * @param {boolean} addToEnd - If true,  the item will be added to the end of the menu list
 */
BasicPanel.prototype.addRightMenuItem = function (menuLabel, callback, addToEnd) {
    this.rightMenu.addMenuItem(menuLabel, callback, addToEnd);
};

/**
 * Aggregator function to create all the menus
 * @private
 */

BasicPanel.prototype._createMenus = function () {
    this._createRightMenu();
    this.setupRightMenu();
    this._createLeftMenu();
    this.setupLeftMenu();
};

/**
 * Function that's called when the menus are being created as part of the initialization. It must be overloaded by the derived class. However, items can be created at any time using addRightItem()
 */

BasicPanel.prototype.setupRightMenu = function () {

};

/**
 * Function that's called when the menus are being created as part of the initialization. It must be overloaded by the derived class.
 */

BasicPanel.prototype.setupLeftMenu = function () {

};

/**
 * Displays the panel
 */

BasicPanel.prototype.showPanel = function () {
    if (!this.panel.get('visible')) {
        this.panel.show();
        //$('#' + this.getPanelId()).focus();
        this.panel.focus();
    }
};

/**
 * Hides the panel. Note that it doesn't destroys the state of the panel. Panel will still receive events, if any.
 */

BasicPanel.prototype.hidePanel = function () {
    this.panel.hide();
};

BasicPanel.createViewToggle = function () {
    $(document).on('click', '.arrowup', function (e) {
        $(this).parents('.yui3-panel').find('.yui3-widget-bd').toggle();
        $(this).toggle();
        $(this).parent().find('.arrowdown').toggle();
    });

    $(document).on('click', '.arrowdown', function (e) {
        $(this).parents('.yui3-panel').find('.yui3-widget-bd').toggle();
        $(this).toggle();
        $(this).parent().find('.arrowup').toggle();
    });
};

BasicPanel.prototype.enablePanelSharing = function () {
    this.enableMouseMoveEvent();
    this.enableMouseClickEvent();
    this.enableKeyPressEvent();
};

BasicPanel.prototype.enableMouseMoveEvent = function () {
    var that = this;
    $('#' + this.panelName).mousemove(function (event) {
        var panelElem = $('#' + that.panelName);
        var x = event.pageX - panelElem.offset().left;
        var y = event.pageY - panelElem.offset().top;
        that.Y.socksMgr.getSocket('mainwebsocket').send(JSON.stringify({
            message: 'panel-movement-data',
            data: {panelname: that.panelClassName, event: 'mousemove', x: x, y: y}
        }));
    });
};

BasicPanel.prototype.enableMouseClickEvent = function () {
    var that = this;
    $('#' + this.panelName).click(function (event) {
        var panelElem = $('#' + that.panelName);
        var x = event.pageX - panelElem.offset().left;
        var y = event.pageY - panelElem.offset().top;
        var elem = $(document.elementFromPoint(event.pageX, event.pageY));
        console.log(elem);
        that.Y.socksMgr.getSocket('mainwebsocket').send(JSON.stringify({
            message: 'panel-movement-data',
            data: {panelname: that.panelClassName, event: 'click', x: x, y: y, elem: elem.attr('id')}
        }));
    });
};

BasicPanel.prototype.enableKeyPressEvent = function () {
    var that = this;
    $('#' + this.panelName).keypress(function (event) {
        var panelElem = $('#' + that.panelName);
        var x = event.pageX - panelElem.offset().left;
        var y = event.pageY - panelElem.offset().top;
        that.Y.socksMgr.getSocket('mainwebsocket').send(JSON.stringify({
            message: 'panel-movement-data',
            data: {panelname: that.panelClassName, event: 'keypress', which: event.which}
        }));
    });
};


BasicPanel.prototype.disablePanelSharing = function () {
    $('#' + this.panelName).off("mousemove click");
};

BasicPanel.prototype.acceptPanelSharing = function () {
    this.acceptPanelEvents = true;
};

BasicPanel.prototype.stopAcceptingPanelSharing = function () {
    this.acceptPanelEvents = false;
    $('#cursor-img').hide();
};

BasicPanel.prototype.handlePanelSharingEvent = function (data) {
    var eventHandling = {
        'mousemove': this.handleMouseMoveEvent.bind(this),
        'click': this.handleMouseClickEvent.bind(this),
        'keypress': this.handleKeyPressEvent.bind(this)
    };

    eventHandling[data.event](data);
};

BasicPanel.prototype.handleMouseMoveEvent = function (data) {
    var panelElem = $('#' + this.panelName);
    var newx = panelElem.offset().left + data.x;
    var newy = panelElem.offset().top + data.y;
    $('#cursor-img').show().css('z-index', 99999).offset({top: newy, left: newx});

};

BasicPanel.prototype.handleMouseClickEvent = function (data) {
    var cursorImg = $('#cursor-img');
    cursorImg.hide();

    var panelElem = $('#' + this.panelName);
    var newx = panelElem.offset().left + data.x;
    var newy = panelElem.offset().top + data.y;

    var clickElem = $('#' + data.elem);
    if (clickElem.is('input')) {
        clickElem.focus().click();
    }
    else {
        var elem = $(document.elementFromPoint(newx, newy));
        console.log('click');
        console.log(elem);
        elem.focus().click();
    }

    cursorImg.show();
};

BasicPanel.prototype.handleKeyPressEvent = function (data) {
    var cursorImg = $('#cursor-img');
    cursorImg.hide();

    var panelElem = $('#' + this.panelName);
    var elem = $(document.activeElement);
    console.log(elem);
    switch (data.which) {
        case 8:
            elem.val(elem.val().slice(0, -1));
            break;

        default:
            elem.focus().val(elem.val() + String.fromCharCode(data.which));
            break;
    }


    cursorImg.show();
};


/**
 * Sets up the generic event listeners
 * @private
 */

BasicPanel.prototype._setupEvents = function () {
    var that = this;
    this.Y.on(this.panelEvent, function (data) {
        eval('that.' + data.fn + '(data.fnData)');
    });
};

/**
 * Resets the title of the panel
 * @param {string} newTitle - New Title
 */

BasicPanel.prototype.setPanelTitle = function (newTitle) {
    this.panelTitle = newTitle;
    this.refreshPanelTitle();

};


BasicPanel.prototype.refreshPanelTitle = function () {
    console.log('tabNum:', this.parentTab.getTabNum());
    $('#' + this.panel.get('boundingBox').get('id') + ' .panel-title').parent().empty().append(this.headerTitleTemplate({
        title: this.panelTitle,
        tabNum: this.parentTab.getTabNum()
    }));
};


/**
 * Creates a simple, generic dialog that can be used to display simple messages
 * @private
 */

BasicPanel.prototype._createSimpleDialog = function () {
    this.simpleDialog = new this.Y.Panel({
        headerContent: '<div class="header-title"></div>',
        bodyContent: '<div class="simple-dialog-message icon-none"></div>',
        zIndex: this.panel.get('zIndex'),
        modal: false,
        visible: false,
        centered: false,
        render: false,
        buttons: {
            footer: [
                {
                    name: "proceed",
                    label: "OK",
                    action: "onOK"
                },
                {
                    name: "cancel",
                    label: "Cancel",
                    action: "onCancel"
                }
            ]
        },
        plugins: [this.Y.Plugin.Drag]
    });

    this.simpleDialog.onCancel = function (e) {
        e.preventDefault();
        this.hide();
        // the callback is not executed, and is
        // callback reference removed, so it won't persist
        this.callback = false;
    };

    this.simpleDialog.onOK = function (e) {
        e.preventDefault();
        this.hide();
        // code that executes the user confirmed action goes here
        if (this.callback) {
            this.callback();
        }
        // callback reference removed, so it won't persist
        this.callback = false;
    };

    this.simpleDialog.render('#' + this.getPanelId());
};

/**
 * Displays a simple dialog with customizable title, text and two buttons (OK, Cancel) and calls the callback function upon the click of OK
 * @param {string} title - Dialog Title
 * @param {string} text - Text for the body of the dialog
 * @param {Function} cb - Callback that will be called when OK is clicked
 */

BasicPanel.prototype.showSimpleDialog = function (title, text, cb) {
    $('#' + this.simpleDialog.get('id') + ' .header-title').html(title);
    $('#' + this.simpleDialog.get('id') + ' .simple-dialog-message').html(text);

    this.simpleDialog.callback = cb;

    this.simpleDialog.align('#' + this.panel.get('boundingBox').get('id') + ' .yui3-widget-bd', [this.Y.WidgetPositionAlign.TC, this.Y.WidgetPositionAlign.TC]);

    this.simpleDialog.set("zIndex", this.panel.get("zIndex") + 1);

    this.simpleDialog.show();
};

BasicPanel.prototype.alignPanel = function (selector, coordsArray) {
    this.panelAlignSelector = selector;
    this.panelAlignCoords = coordsArray;
    this.panel.align(selector, coordsArray);
};

/**
 * Calls a function of the encapsulated YUI Panel object directly. For YUI Panel API, refer to YUI 3 documentation
 * @param {string} functionName - Panel function to be called
 * @param {...*} params - Parameters to be passed to the YUI panel function call
 * @returns {*} Whatever the function may return, if any
 */
BasicPanel.prototype.callPanel = function () {
    return this.panel[arguments[0]].apply(this.panel, Array.prototype.slice.call(arguments, 1));
};

BasicPanel.prototype.realignPanel = function () {
    if (this.panelAlignCoords && this.panelAlignCoords) {
        this.panel.align(this.panelAlignSelector, this.panelAlignCoords);
    }
};

/**
 * Sets the inner HTML value of the specified element inside the Panel
 * @param {string} selector - Javascript query selector string
 * @param {string} value - HTML
 */
BasicPanel.prototype.setPanelElement = function (selector, value) {
    $('#' + this.panel.get('boundingBox').get('id') + ' ' + selector).html(value);
};

/**
 * Returns an YUI Node object for an HTML element contained inside the panel
 * @param {string} selector - Javascript query selector
 * @returns {Node} YUI Node Object
 */
BasicPanel.prototype.getPanelElement = function (selector) {
    return this.Y.one('#' + this.panel.get("boundingBox").get('id') + ' ' + selector);
};

/**
 * Returns a JQuery object for an HTML element contained inside the panel
 * @param {string} selector - Javascript query selector
 * @returns {Object} Jquery object
 */
BasicPanel.prototype.getJQPanelElement = function (selector) {
    return $('#' + this.panel.get("boundingBox").get('id') + ' ' + selector);
};

/**
 * Makes a POST Ajax based call to a given url and expects returned data to be in JSON format
 * @param {string} url
 * @param {string/object} data - Query parameters
 * @param {Function} callback - Callback function with data as a parameter
 */
BasicPanel.prototype.doAjaxJSONCall = function (url, data, callback, method) {
    this.Y.screenManager.doAjaxJSONCall(url, data, callback, method);
};

BasicPanel.prototype.sendComponentData = function (typeId, serverNodeId, command, commandData, callback, method) {
    this.Y.screenManager.sendComponentData(typeId, serverNodeId, command, commandData, callback, method);
};

/**
 * Setting function for the panel object
 * @param {string} attribute
 * @param {*} value
 */
BasicPanel.prototype.set = function (attribute, value) {
    this[attribute] = value;
};

/**
 * Getter function for the panel object; returns null if the attribute is not present.
 * @param {string} attribute
 * @returns {*|null}
 */
BasicPanel.prototype.get = function (attribute) {
    return this[attribute] || null;
};

/**
 * Tries to determine if the string contains proper JSON
 * @param {string} jsonString
 * @returns {boolean}
 * @private
 */
BasicPanel.prototype._tryParseJSON = function (jsonString) {
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns 'null', and typeof null === "object",
        // so we must check for that, too.
        if (o && typeof o === "object" && o !== null) {
            return o;
        }
    }
    catch (e) {
    }

    return false;
};

/**
 * Adds a new edge to a given node in the components table
 * @param {Object} newEdgeData
 * @param callback
 */
BasicPanel.prototype.addNewEdge = function (newEdgeData, callback) {
    this.doAjaxJSONCall(
        "./" + this.typeNodeId + "/none",
        {command: "addNewEdge", data: JSON.stringify(newEdgeData)},
        function (data) {
            //console.log('addNewEdge-ret:', data);
            if (typeof callback !== "undefined") {
                callback(data);
            }
        }
    )
};

/**
 * Removes an edge from a given node in the components tables
 * @param {Object} edgeData
 * @param callback
 */
BasicPanel.prototype.removeEdge = function (edgeData, callback) {
    this.doAjaxJSONCall(
        "./" + this.typeNodeId + "/none",
        {command: "removeEdge", data: JSON.stringify(edgeData)},
        function (data) {
            if (typeof callback !== "undefined") {
                callback(data);
            }
        }
    )
};

/**
 * Default function to retrieve left menu (or any menu made using LeftMenu class) items from the server-side component
 * @param {BasicMenu} menu - Target menu
 */
BasicPanel.prototype.setLeftMenuData = function (menu) {
    var that = this;
    console.log("BasicPanel / setLeftMenuData = " + './' + this.threadItem.Type + '/' + this.threadItem.Node);
    console.log("BasicPanel / setLeftMenuData = ", {
        command: 'getleftmenu',
        roleInObject: this.roleInObject,
        roleInThread: this.roleInThread,
        accountId: this.accountItem.Node
    });

    this.doAjaxJSONCall(
        './' + this.threadItem.Type + '/' + this.threadItem.Node,
        {
            command: 'relayServerTip',
            data: JSON.stringify({
                command: 'getleftmenu',
                roleInObject: this.roleInObject,
                roleInThread: this.roleInThread,
                accountId: this.accountItem.Node
            })
        },
        function (data) {
            console.log("BasicPanel / setLeftMenuData Result = ", data);
            menu.reloadTreeData(data.items);
        }
    );
};

/**
 * Given the initialization data, this function creates and displays a panel at the root level (as opposed to a child panel)
 * @param data
 */
BasicPanel.prototype.openPanel = function (data, callback, panelName) {
    var panel, that = this;
    if (panel = this.Y.screenManager.getPanelInstance(panelName || data.initData.serverNodeId)) {
        panel.showPanel();
    }
    else {
        this.Y.screenManager.initializePanel(data.panelType, data.initData, function (error, panel) {
            if (error) {
                return console.log('error:', error);
            }
            that.Y.screenManager.addPanelInstance(panelName || data.initData.serverNodeId, panel);
            panel.showPanel();
            if (typeof callback !== "undefined") {
                callback();
            }
        });
    }
};

/**
 *
 * @param newPermissionData
 * @param callback
 */
BasicPanel.prototype.addNewPermission = function (newPermissionData, callback) {
    this.sendComponentData(
        this.typeNodeId,
        "none",
        "addNewPermission",
        newPermissionData,
        callback
    );
};

BasicPanel.prototype.setTab = function (tabIndex) {
    this.set('parentTab', this.Y.screenManager.getTab(tabIndex));
    this.refreshPanelTitle();
};

BasicPanel.prototype.addShareOption = function () {
    this.addRightMenuItem("Share", this.sharePanelHandler.bind(this));
    this.addRightMenuItem("Invite", this.inviteForShareHandler.bind(this));
    this.addRightMenuItem("Unshare", this.unsharePanelHandler.bind(this));

    this.hideRightMenuItem("Invite");
    this.hideRightMenuItem("Unshare");
};

BasicPanel.prototype.sharePanelHandler = function () {
    var tabIndex = this.Y.screenManager.getLastCreatedTabIndex();
    var that = this;
    if (tabIndex === null) {
        this.Y.screenManager.createTab(function (error, tabNum) {
            if (error) {
                return console.log('Error:', error);
            }
            that.setTab(tabNum);
            that.setPanelSharing();
        });
    }
    else {
        this.setTab(tabIndex);
        this.setPanelSharing();
    }
};

BasicPanel.prototype.setPanelSharing = function () {
    this.hideRightMenuItem("Share");
    this.unhideRightMenuItem("Invite");
    this.unhideRightMenuItem("Unshare");
};

BasicPanel.prototype.unsharePanelHandler = function () {
    this.hideRightMenuItem("Unshare");
    this.hideRightMenuItem("Invite");
    this.unhideRightMenuItem("Share");

    this.setTab(this.Y.screenManager.getBaseTabIndex());
};

BasicPanel.prototype.inviteForShareHandler = function () {
    console.log('invite');
};

BasicPanel.prototype.hideRightMenuItem = function (menuLabel) {
    this.rightMenu.hideMenuItem(menuLabel);
};

BasicPanel.prototype.unhideRightMenuItem = function (menuLabel) {
    this.rightMenu.unhideMenuItem(menuLabel);
};

BasicPanel.prototype.createChildFormPanel = function (panelName, panelTitle, formData, callback) {
    var panelAttributes = {
        panelTitle: panelTitle,
        rawFormData: formData
    };

    this.addChildPanel(this.formPanelType, panelName, panelAttributes, callback);
};

BasicPanel.prototype.addRefreshOption = function () {
    this.addRightMenuItem("Refresh", this.refreshPanelHandler.bind(this));
};

BasicPanel.prototype.refreshPanelHandler = function () {
    this.sendComponentData(
        this.typeNodeId,
        this.serverNodeId,
        "relayServerTip",
        {
            command: "refreshPanel"
        },
        this.refreshPanel.bind(this)
    );
};

BasicPanel.prototype.refreshPanel = function (data) {

};

BasicPanel.prototype.getUrlData = function (url, callback) {
    $.ajax({
        type: 'GET',
        url: url,
        cache: false,
        success: function (data) {
            callback(null, data);
        },
        error: function (err) {
            callback(err);
        }
    });
};

BasicPanel.prototype.oxygenClickEvent = function (linkElem, e) {
    //console.log('ClickEvent:', e);
    //console.log('Target:', e.currentTarget);

    console.log('click:', $(linkElem).data('oldonclick'));
};

BasicPanel.createViewToggle();