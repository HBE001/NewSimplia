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
 * @param {Object} Y - YUI Global Object
 * @param {Object} properties - Panel attributes
 * @constructor
 */
function MogopakPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    //Default title
    this.panelTitle = "Mogopak Panel";
    this.savePanelName = "savemogopakpanel;";
    this.mainMogopakFolder = "Mogopaks";
    this._addedScripts = '<script src="//service2015.s3.amazonaws.com/mogopak-code/olib.js"></script>';

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
MogopakPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Main initialization function that also fetches the Mogopak URL data
 * @param {Function} cb - Callback function
 */
MogopakPanel.prototype.init = function(cb) {
    var that = this;
    BasicPanel.prototype.init.call(this, function(){
        if(typeof cb !== "undefined") {
            that.executePageScripts();
            that.createBrowseMenu();
            that.addSavePanel();
            cb();
        }
    });
};

MogopakPanel.prototype.setupLeftMenu = function() {
    BasicPanel.prototype.setupLeftMenu.call(this);

    this.setLeftMenuData(this.leftMenu);
};

MogopakPanel.prototype.executePageScripts = function() {
    var scripts = this.getJQPanelElement('script');
    tinyMCE.mogopakPanel = this;
    scripts.each(function(index, script){
        $.globalEval(script.innerHTML);
    });
};

MogopakPanel.prototype.createBrowseMenu = function() {
    this.browseMenu = new BrowseMenu(this.Y, {parentPanel: this});
    this.browseMenu.init();
    this.setLeftMenuData(this.browseMenu);
    this.browseMenu.setAlignParams("#" + this.panel.get('id') + ' .yui3-widget-bd', [this.Y.WidgetPositionAlign.TR, this.Y.WidgetPositionAlign.TC]);
    this.browseMenu.setTreeClickHandler(this.handleTreeClick, this);
};

MogopakPanel.prototype.handleTreeClick = function(event, data) {
    var permissionMode = {
        'image': this.imageTreeClick.bind(this),
        'media': this.mediaTreeClick.bind(this),
        'link': this.linkTreeClick.bind(this),
        'backgroundimage': this.backgroundImageTreeClick.bind(this),
        'openmogopak': this.openMogopakTreeClick.bind(this)
    };
    var that = this;

    if(typeof permissionMode[this.treeMode] !== "undefined") {
        this.sendComponentData(
            this.threadItem.Type,
            'none',
            'getPermissionData',
            {
                id: data.node.key
            },
            function (data) {
                if (data.error) {
                    return console.log('Error:', data.errorInfo);
                }
                permissionMode[that.treeMode](event, data.data);
            }
        );
    }
};

MogopakPanel.prototype.imageTreeClick = function(event, data) {
    tinyMCE.get('content').execCommand('mceAdvImage');
    this.browseMenu.hideMenu();

    var imagePath = this.Y.oxygenConfig.s3.urlPrefix + data.OnObject;
    this.executeFnWithInterval(function(){
        return tinyMCE.imageDialog.setImagePath(imagePath);
    });
};



MogopakPanel.prototype.mediaTreeClick = function(event, data) {
    tinyMCE.get('content').execCommand('mceMedia');
    this.browseMenu.hideMenu();

    var mediaPath = this.Y.oxygenConfig.s3.urlPrefix + data.OnObject;
    this.executeFnWithInterval(function(){
        return tinyMCE.window.Media.setPath(mediaPath)
    });
};

MogopakPanel.prototype.linkTreeClick = function(event, data) {
    tinyMCE.get('content').execCommand('mceAdvLink');
    this.browseMenu.hideMenu();

    var linkPath = this.Y.oxygenConfig.s3.urlPrefix + data.OnObject;
    this.executeFnWithInterval(function(){
        var iframes = $('.clearlooks2').find('iframe');
        if(iframes.length > 0) {
            if(iframes[0].contentWindow.setLinkFormValue) {
                return iframes[0].contentWindow.setLinkFormValue(linkPath);
            }
        }

    });
};

MogopakPanel.prototype.backgroundImageTreeClick = function(event, data) {
    tinyMCE.get('content').execCommand('mceStyleProps');
    this.browseMenu.hideMenu();

    var linkPath = this.Y.oxygenConfig.s3.urlPrefix + data.OnObject;
    this.executeFnWithInterval(function(){
        var iframes = $('.clearlooks2').find('iframe');
        if(iframes.length > 0) {
            if(iframes[0].contentWindow.setBackgroundPath) {
                return iframes[0].contentWindow.setBackgroundPath(linkPath);
            }
        }

    });
};


MogopakPanel.prototype.executeFnWithInterval = function(fn) {
    var counter = 0;
    var intervalId = setInterval(function () {
        var retVal = fn();
        console.log('retVal:', retVal);
        counter++;
        //console.log('counter', that.counter);
        if(retVal || counter == 20){
            clearInterval(intervalId);
        }
    }, 200);
};

MogopakPanel.prototype.openFileBrowserDialog = function(mode) {
    this.browseMenu.showMenu();
    this.treeMode = mode;
    if(typeof tinyMCE.tinyMCEPopup !== "undefined") {
        tinyMCE.tinyMCEPopup.close();
    }
};

MogopakPanel.prototype.imagesPopupLoaded = function() {
    if((typeof this._imagesTreeClicked !== "undefined") && this._imagesTreeClicked) {
        var imagePath = this.Y.oxygenConfig.s3.urlPrefix + this._imagesTreeClickData.node.key;
        //console.log('path:', this.Y.oxygenConfig.s3.urlPrefix + this._imagesTreeClickData.node.key);
        var counter = 0;
        var intervalId = setInterval(function () {
            var retVal = tinyMCE.imageDialog.setImagePath(imagePath);
            counter++;
            //console.log('counter', that.counter);
            if(retVal || counter == 20){
                clearInterval(intervalId);
            }
        }, 200);

        this._imagesTreeClicked = 0;
    }
};

MogopakPanel.prototype.addSavePanel = function() {
    /*
    this.addChildPanel(
        this.savePanelClass,
        this.savePanelName,
        {
            typeNodeId: this.typeNodeId,
            serverNodeId: this.serverNodeId,
            role: this.role
        },
        function(error, panel){
            if(error) {
                return console.log('error:', error);
            }
        }
    );
    */

    var formData = [];
    var that = this;

    formData.push([{type: 'text', value: "Project Name"}, {type: "textbox", value:''}]);
    formData.push([{type: 'text', value: "Page Number"}, {type: "textbox", value:''}]);
    formData.push([{type: 'text', value: "Save"}, {type: "button", name: "Save", callback: function(){ that._save();}}]);

    this.createChildFormPanel(this.savePanelName, "Save Mogopak", formData, function(error, panel) {
        if(error) {
            return console.log('error:', error);
        }

    });

};

MogopakPanel.prototype.openMogopakTreeClick = function(event, data) {
    var that = this;
    this.browseMenu.hideMenu();
    async.waterfall([
        function(callback) {
            that.sendComponentData(
                that.typeNodeId,
                that.serverNodeId,
                'relayServerTip',
                {
                    command: 'getsignedurl',
                    id: data.OnObject
                },
                function(data) {
                    callback(data.error || null, data);
                }
            );
        },
        function(data, callback) {
            that.getUrlData(data.url, callback)
        }
    ], function(error, urlData){
        if(error){
            return console.log('Error:', error);
        }
        tinyMCE.activeEditor.setContent(urlData, {format: 'raw'});
        that.currentMogopakId = data.OnObject;
    });
};

MogopakPanel.prototype.publishMogopak = function() {
    if(typeof this.currentMogopakId === "undefined") {
        this.showSimpleDialog('Error', 'There is no saved Mogopak currently opened. Either save the current Mogopak or open an existing one', function(){
        });
    }
    else {
        this.sendComponentData(
            this.typeNodeId,
            this.serverNodeId,
            'relayServerTip',
            {
                command: "publishMogopak",
                id: this.currentMogopakId
            },
            function(data) {
                if(typeof data.error !== "undefined" && data.error) {
                    return console.log('Error:', data.errorInfo);
                }
                window.open(data.url, '_blank');
            }
        )
    }
};

MogopakPanel.prototype._save = function() {
    var that = this;

    var formData = this.childPanel(this.savePanelName).collectFormData();
    this.sendComponentData(
        this.typeNodeId,
        this.serverNodeId,
        "relayServerTip",
        {
            command: "savemogopakpage",
            data: formData
        },
        function(data) {
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
                    data: that.augmentContent(),
                    success: function() {
                        var params = {
                            id: data.id,
                            displayName: data.mogopakName,
                            roleInObject: that.roleInObject,
                            roleInThread: that.roleInThread,
                            parentList: [that.mainMogopakFolder, data.mogopakName],
                            info: {
                                accountItem: that.accountItem,
                                threadItem: that.threadItem,
                                grants: 1
                            }
                        };
                        that.addNewPermission(params, function(permissionData){
                            that.currentMogopakId = data.id;
                            that.childPanel(that.savePanelName).hidePanel();
                        });

                    }
                });

            }
        }
    );
};

MogopakPanel.prototype.augmentContent = function() {
    var combinedData = this._addedScripts + tinyMCE.activeEditor.getContent();
    return combinedData;
};