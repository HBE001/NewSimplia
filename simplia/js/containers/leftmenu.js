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

function LeftMenu(Y, properties) {
    //Calling base constructor
    BasicMenu.call(this, Y);

    this.containerClass = "leftmenu-container";
    this.headerTitle = "Navigation";
    this.uploadPanelName = "uploadpanel";
    this.selectedForCopy = [];
    this.editedNode = {};
    this.uploadNode = {};

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
LeftMenu.prototype = Object.create(BasicMenu.prototype);


LeftMenu.prototype.init = function(callback) {
    var that = this;
    BasicMenu.prototype.init.call(this, function(){
        that.menu.set('buttons', {});

        that.menu.set('bodyContent','<div class=' + that.containerClass + '></div>');
        that.menu.set('headerContent', '<div class="header-title"><span>' + that.headerTitle + '</span><span class="panelsalignright checklistmenuleftaction">&nbsp;&nbsp;&#9776;</span></div>');

        that._createLeftActionMenu();

        that.leftMenuTreeElem = $('#' + that.menu.get('id') + ' .' +  that.containerClass);
        that.createMenuTree();

        that._alignElem = "#" + that.parentPanel.panel.get('id') + ' .yui3-widget-bd';
        that._alignCoorids = [that.Y.WidgetPositionAlign.TL, that.Y.WidgetPositionAlign.TL];
        that._addMenuEventHandlers();

        if(typeof callback !== "undefined") {
            callback();
        }
    });
};

LeftMenu.prototype._createLeftActionMenu = function() {
    this.actionMenu = new LeftActionMenu(this.Y, {parentMenu: this, parentPanel: this.parentPanel, parentTab: this.parentTab});
    this.actionMenu.init();

    this._addUploadMenuItem();
    this._addPasteMenuItem();
    this._addCutMenuItem();
    this._addCopyMenuItem();
    this._addCreateChildFolderMenuItem();
    this._addCreateFolderMenuItem();
};

LeftMenu.prototype._addPasteMenuItem = function() {
    var that = this;
    this.actionMenu.addMenuItem('Paste Item', function(){
        that.selectedForCopy.forEach(function(node){
            if(!node.folder) {
                var selectedNodes = that.leftTree.getSelectedNodes();
                if(selectedNodes.length > 0) {
                    var newNode = selectedNodes[0].addNode(node);
                    if(that.cutMode) {
                        node.remove();
                    }
                    if(!selectedNodes[0].isExpanded()) {
                        selectedNodes[0].toggleExpanded();
                    }
                    var parents = newNode.getParentList(false, true);
                    var parentList = [];
                    parents.forEach(function(parent){
                        parentList.push(parent.title);
                    });
                    var newEdgeData = {
                        role: that.parentPanel.role,
                        parentList: parentList,
                        id: newNode.key,
                        info: newNode.data.info
                    };

                    that.parentPanel.addNewEdge(newEdgeData, function(data){
                        that.parentPanel.removeEdge(newNode.data.info, function(data){
                            //Do we need to refresh?
                            //that.parentPanel.setLeftMenuData();
                        });
                    });

                }
            }
        });
    });
};

LeftMenu.prototype._addCutMenuItem = function() {
    var that = this;
    this.actionMenu.addMenuItem('Cut Item', function(){
        var selectedNodes = that.leftTree.getSelectedNodes();
        if(selectedNodes.length > 0) {
            that.selectedForCopy = selectedNodes;
            that.cutMode = true;
        }
    });
};

LeftMenu.prototype._addCopyMenuItem = function() {
    var that = this;
    this.actionMenu.addMenuItem('Copy Item', function(){
        var selectedNodes = that.leftTree.getSelectedNodes();
        if(selectedNodes.length > 0) {
            that.selectedForCopy = selectedNodes;
            that.cutMode = false;
        }
    });
};

LeftMenu.prototype._addCreateChildFolderMenuItem = function() {
    var that = this;
    this.actionMenu.addMenuItem('Create New Child Folder', function(){
        var selectedNodes = that.leftTree.getSelectedNodes();
        if(selectedNodes.length > 0 && selectedNodes[0].isFolder()) {
            console.log('selectedNodes:', selectedNodes);
            that.editedNode = selectedNodes[0].editCreateNode('child',{
                title: 'New Folder',
                folder: true
            });
        }
    });
};

LeftMenu.prototype._addCreateFolderMenuItem = function() {
    var that = this;
    this.actionMenu.addMenuItem('Create New Folder', function(){
        var selectedNodes = that.leftTree.getSelectedNodes();
        if(selectedNodes.length > 0 && selectedNodes[0].isFolder()) {
            that.editedNode = selectedNodes[0].editCreateNode('after',{
                title: 'New Folder',
                folder: true
            });

        }
    });
};

LeftMenu.prototype._addUploadMenuItem = function() {
    var that = this;
    this.actionMenu.addMenuItem('Upload File(s)', function() {
        var selectedNodes = that.leftTree.getSelectedNodes();
        if(selectedNodes.length > 0 && selectedNodes[0].isFolder()) {
            that.uploadNode = selectedNodes[0];
            var parents = that.uploadNode.getParentList(false, true);
            var parentList = [];
            parents.forEach(function(parent){
                parentList.push(parent.title);
            });
            var newEdgeParams = {
                role: that.parentPanel.role,
                parentList: parentList,
                info: {
                    accountItem: that.parentPanel.accountItem,
                    threadItem: that.parentPanel.threadItem,
                    grants: 1
                }
            };

            console.log("newEdgeParams = ", newEdgeParams);

            if(typeof that.childPanel(that.uploadPanelName) === "undefined") {
                that.addChildPanel(
                    that.uploadPanelName,
                    that.uploadPanelName,
                    {
                        uploadCallback: that._uploadComplete,
                        uploadCallbackObj: that,
                        parentPanel: that.parentPanel
                    },
                    function(error, panel) {
                        if (error) {
                            console.log('Error:', error);
                        }
                        panel.setUploadParams(newEdgeParams);
                        panel.bringToTop(that);
                        panel.showPanel();
                    }
                );
            }
            else {
                that.childPanel(that.uploadPanelName).setUploadParams(newEdgeParams);
                that.childPanel(that.uploadPanelName).bringToTop(that);
                that.childPanel(that.uploadPanelName).showPanel();
            }
        }
    });
};

LeftMenu.prototype._uploadComplete = function(file, res, params) {
    //var newEdgeParams = {
    //    role: that.parentPanel.role,
    //    parentList: parentList,
    //    info: {
    //        accountItem: that.parentPanel.accountItem,
    //        threadItem: that.parentPanel.threadItem,
    //        grants: 1
    //    },
    //    parentList: file.originalFilename,
    //    id: file.uploadSettings.id,
    //    displayName: file.originalFilename,
    //    roleInObject: this.parentPanel.roleInObject,
    //    roleInThread: this.parentPanel.roleInThread,
    //    grants: 1
    //};

    var newParams = JSON.parse(JSON.stringify(params));
    newParams.parentList.push(file.originalFilename);
    newParams.id = file.uploadSettings.id;
    newParams.displayName = file.originalFilename;
    newParams.roleInObject = this.parentPanel.roleInObject;
    newParams.roleInThread = this.parentPanel.roleInThread;
    newParams.grants = 1;

    var that = this;
    this.parentPanel.addNewPermission(newParams, function(data){
        that.uploadNode.addNode({
            title: file.originalFilename,
            key: data.permission.Node,
            info: newParams.info
        });
    });
};

LeftMenu.prototype.createMenuTree = function() {
    var that = this;
    $(this.leftMenuTreeElem).fancytree({
        extensions: ["edit"],
        edit: {
            beforeEdit: $.noop,
            save: function(event, data) {
                data.node.setTitle(data.input.val());
                return true;
            }
        },
        selectMode: 2,
        icons: true,
        checkbox: true,
        source: [],
        click: function(event, data) {
            if(!data.node.isFolder() && data.targetType == "title") {
                that.handleTreeClick(event, data);
                //return false;
            }
        },
        keydown: function(event, data) {
            console.log('key:', event.which);
            if(data.node == that.editedNode && event.which == 32) {
                data.node.editEnd();
            }
        }

    });
    this.leftTree = $(this.leftMenuTreeElem).fancytree("getTree");
};

LeftMenu.prototype.handleTreeClick = function(event, data) {
    if(typeof this.treeClickHandler !== "undefined"){
        if(typeof this.treeClickHandlerObj !== "undefined") {
            this.treeClickHandler.call(this.treeClickHandlerObj, event, data);
        }
        else {
            this.treeClickHandler.call(null, event, data);
        }
    }
    else {
        this.parentPanel.handleLeftMenuTreeClick(event, data);
    }
};

LeftMenu.prototype.reloadTreeData = function(treeSource) {
    this.leftTree.reload(treeSource).done(function(){});
};

LeftMenu.prototype._addMenuEventHandlers = function() {
    this._addHideEventHandler();
    this._addClickEventHandler();
};

LeftMenu.prototype._addHideEventHandler = function() {
    this.menu.after("visibleChange", function (e) {
        if (!e.newVal) {
            this.actionMenu.hideMenu();
        }
    }, this);
};

LeftMenu.prototype._addClickEventHandler = function() {
    this.Y.one("#" + this.parentPanel.panel.get('id') + " .checklistmenuleft").on("click", function(){
        //Ensuring that the menu option is displayed on top of the parent panel;
        this.menu.set("zIndex", this.parentPanel.panel.get("zIndex") + 1);

        this.menu.align(this._alignElem, this._alignCoorids);
        this.showMenu();
    },this);
};

LeftMenu.prototype.setAlignParams = function(elem, coordinates) {
    this._alignElem = elem;
    this._alignCoorids = coordinates;

    this.menu.align(this._alignElem, this._alignCoorids);
};

LeftMenu.prototype.setTreeClickHandler = function(handler, handlerObj) {
    this.treeClickHandler = handler;
    if(typeof handlerObj !== "undefined") {
        this.treeClickHandlerObj = handlerObj;
    }
};