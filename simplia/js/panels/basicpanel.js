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
    this.panel = "";
    this.Y = Y;
    this.mainPanelEvent = "panelevent";
    this.rightMenu = "";
    this.leftMenu = "";
    this.checkboxMenu = "";
    this.selectedRecord = "";
    this.failCode = "fail";
    this.passCode = "pass";
    this.shareEventHandler = "";
    this.acceptPanelEvents = false;
    this.parsedFileData = {};
    this.treeSource = [];
    this.panelTitle = "";
    this.panelEvent = "";
    this.simpleDialog = "";
    this.bodyContent = "";

    this.panelAlignSelector = "";
    this.panelAlignCoords = "";


    this.headerTitleSpanHtml = '<span class="panel-title">{{title}}</span>';

    this.headerTemplateHtml = '<div class="header-title"><span class="alignleft"><span class="alignleft mainpanel_option checklistmenuleft">&#9776;&nbsp;&nbsp;</span></span><span>' +
        this.headerTitleSpanHtml + '</span><span class="alignleft"></span><span class="alignleft mainpanel_option"><span class="arrow">' +
        '<span class="arrowup" style="display:none;">&#9650;</span><span class="arrowdown">&#9660;</span></span></span>' +
        '<span class="panelsalignright checklistmenuright">&#9776;</span></div>';


    this.headerTemplate = this.Y.Handlebars.compile(this.headerTemplateHtml);
    this.headerTitleTemplate = this.Y.Handlebars.compile(this.headerTitleSpanHtml);

    this.childPanels = {};
}

/**
 * Init is the first function that ought to be executed
 * @param {function} callback - Callback function
 */
BasicPanel.prototype.init = function (callback) {
    this._createMainPanel();
    this._createMenus();
    this._setupMainPanelEventHandlers();
    //this._setupEventHandlers();
    this._setupEvents();
    this._createSimpleDialog();
    if (typeof callback !== "undefined") {
        callback();
    }
};

/**
 * Main function that's used to create the panel
 * @private
 */
BasicPanel.prototype._createMainPanel = function () {
    this.panel = new this.Y.Panel({
        headerContent: this.headerTemplate({title: this.panelTitle}),
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

    this.panel.render(this.Y.screenManager.getPanelsParentDiv());

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
    this.panel.after("visibleChange", function (e) {
        if (!e.newVal) {
            Object.keys(this.childPanels).forEach(function (panelName) {
                this[panelName].hidePanel();
            }, this.childPanels);
        }
    }, this);

    this.panel.on("widget:contentUpdate", function (e) {

    }, this);
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
    this.leftMenu = new LeftMenu(this.Y, {parentPanel: this});
};

/**
 * Creates the right menu
 * @private
 */
BasicPanel.prototype._createRightMenu = function () {
    this.rightMenu = new RightMenu(this.Y, {parentPanel: this});
};

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
    this.panel.show();
};

/**
 * Hides the panel. Note that it doesn't destroys the state of the panel. Panel will still receive events, if any.
 */
BasicPanel.prototype.hidePanel = function () {
    this.panel.hide();
};

/*----------------------------------------------------------*/
BasicPanel.prototype.fullScreen = function () {
    this.originalWidth = $("#" + this.panel.get('id') + " .yui3-widget-bd").children().first().width();
    this.originalHeight = $("#" + this.panel.get('id') + " .yui3-widget-bd").children().first().height();
    $("#" + this.panel.get('id') + " .yui3-widget-bd").children().first()
        .height($(window).height() - $("#" + this.panel.get('id') + " .yui3-widget-hd").outerHeight() - 4)
        .width($(window).width() - 4);
    $("#" + this.panel.get('id'))
        .css("left", 0)
        .css("top", 0);
    this.rightMenu.menu.show();
}

/*----------------------------------------------------------*/
BasicPanel.prototype.smallScreen= function () {
    $("#" + this.panel.get('id') + " .yui3-widget-bd").children().first()
        .css("height", this.originalHeight)
        .css("width", this.originalWidth);
    this.rightMenu.menu.show();
}



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


BasicPanel.prototype.getScript = function (url, cb) {
    $.getScript(url)
        .done(function (script, textStatus) {
            cb();
        })
        .fail(function (jqxhr, settings, exception) {
            console.log('error');
        });
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
 * Places the current panel on top of the other specified panel
 * @param {BasicPanel} otherPanel - The panel upon which the current panel will be placed on top.
 */
BasicPanel.prototype.bringToTop = function (otherPanel) {
    this.panel.set("zIndex", otherPanel.panel.get("zIndex") + 1);
};

/**
 * Places the current panel on behind of the other specified panel
 * @param {BasicPanel} otherPanel - The panel upon which the current panel will be placed on top.
 */
BasicPanel.prototype.sendBehind = function (otherPanel) {
    this.panel.set("zIndex", otherPanel.panel.get("zIndex") - 1);
};


/**
 * Resets the title of the panel
 * @param {string} newTitle - New Title
 */
BasicPanel.prototype.setPanelTitle = function (newTitle) {
    $('#' + this.panel.get('boundingBox').get('id') + ' .panel-title').parent().empty().append(this.headerTitleTemplate({title: newTitle}));
};

/**
 * Adds a panel instance of the specified class as a child of the current panel. Child panel works like any normal panel, except that its life and display is linked with the parent panel
 * @param {string} panelName - Valid Panel type name
 * @param {string} name - Identifier for the panel; to be used in calls to childPanel() function
 * @param {Object} properties - Object containing panel attributes
 * @param {Function} callback - Callback to be executed after the panel has been created and initialized
 */
BasicPanel.prototype.addChildPanel = function (panelName, name, properties, callback) {
    var panelCache = this.Y.screenManager.pLoader.getCache(panelName);
    if (typeof panelCache === "undefined") {
        return callback({error: 1, errorInfo: "unknown panel classname"});
    }
    var className = panelCache.config.name;

    var that = this;

    if(typeof panelCache['html'] !== "undefined") {
        properties.bodyContent = panelCache.html;
    }

    this.childPanels[name] = new window[className](this.Y, properties);


    this.childPanels[name].init(function () {
        that.childPanels[name].panel.on('visibleChange', function (e) {
            //Only change the position if the panel is being displayed
            if (e.newVal) {
                this.panel.align('#' + this.parentPanel.panel.get('boundingBox').get('id') + ' .yui3-widget-bd',
                    [this.Y.WidgetPositionAlign.TR, this.Y.WidgetPositionAlign.TR])
            }
        }, that.childPanels[name]);
        callback(null, that.childPanels[name]);
    });
};

/**
 * Retrieves an instance of the speicified child panel
 * @param name - Identifier for the child panel, the same one that was specified in addChildPanel() call
 * @returns {BasicPanel|undefined} - Returns undefined if the panel doesn't exist
 */
BasicPanel.prototype.childPanel = function (name) {
    return (this.childPanels[name] || undefined);
};

/**
 * Creates a simple, generic dialog
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

    this.simpleDialog.render(this.Y.screenManager.getPanelsParentDiv());
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
 * Returns the HTML element id attribute of the main panel div
 * @returns {string} Panel Id
 */
BasicPanel.prototype.getPanelId = function () {
    return this.panel.get('boundingBox').get('id');
};

/**
 * Makes a POST Ajax based call to a given url and expects returned data to be in JSON format
 * @param {string} url
 * @param {string} data - Query parameters
 * @param {Function} callback - Callback function with data as a parameter
 */
BasicPanel.prototype.doAjaxJSONCall = function(url, data, callback) {
    $.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        data: data,
        success: callback
    });
};

BasicPanel.createViewToggle();