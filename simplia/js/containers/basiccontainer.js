function BasicContainer(Y) {
    this.Y = Y;
    this.childPanels = {};
}

BasicContainer.prototype.init = function(callback) {
    if(typeof callback !== "undefined") {
        callback();
    }
};

/**
 * Adds a panel instance of the specified class as a child of the current panel. Child panel works like any normal panel, except that its life and display is linked with the parent panel
 * @param {string} panelName - Valid Panel type name
 * @param {string} name - Identifier for the panel; to be used in calls to childPanel() function
 * @param {Object} properties - Object containing panel attributes
 * @param {Function} callback - Callback to be executed after the panel has been created and initialized
 */
BasicContainer.prototype.addChildPanel = function (panelName, name, properties, callback) {
    var that = this;
    var panelCache = this.Y.screenManager.pLoader.getCache(panelName);
    if (typeof panelCache === "undefined") {
        this.Y.screenManager.pLoader.loadPanelFiles(panelName, function(error){
            panelCache = that.Y.screenManager.pLoader.getCache(panelName);
            if(error) {
                return callback({error: 1, errorInfo: error});
            }
            else if(panelCache === "undefined") {
                return callback({error: 1, errorInfo: "unknown panel type"});
            }
            return that._panelCreator(panelCache, name, properties, callback);
        });

    }
    else {
        return this._panelCreator(panelCache, name, properties, callback);
    }
};

/**
 *
 * @param panelCache
 * @param name
 * @param properties
 * @param callback
 * @private
 */
BasicContainer.prototype._panelCreator = function(panelCache, name, properties, callback) {
    var className = panelCache.config.name;

    var that = this;

    if(typeof panelCache['html'] !== "undefined") {
        properties.bodyContent = panelCache.html;
    }
    if(typeof properties.parentPanel === "undefined") {
        properties.parentPanel = this;
    }

    if(typeof properties.parentTab === "undefined" && typeof this.parentTab !== "undefined") {
        properties.parentTab = this.parentTab;
    }

    this.childPanels[name] = new window[className](this.Y, properties);


    this.childPanels[name].init(function () {
        that.childPanels[name].panel.on('visibleChange', function (e) {
            //Only change the position if the panel is being displayed
            if (e.newVal) {
                this.panel.align('#' + this.parentPanel.container.get('boundingBox').get('id') + ' .yui3-widget-bd',
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
BasicContainer.prototype.childPanel = function (name) {
    return (this.childPanels[name] || undefined);
};


/**
 * Places the current panel on top of the other specified panel
 * @param {BasicContainer} otherContainer - The panel upon which the current panel will be placed on top.
 */
BasicContainer.prototype.bringToTop = function (otherContainer) {
    this.container.set("zIndex", otherContainer.container.get("zIndex") + 1);
};

/**
 * Returns the HTML element id attribute of the main container div
 * @returns {string} Container Id
 */
BasicContainer.prototype.getPanelId = function () {
    return this.container.get('boundingBox').get('id');
};

