/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * © 2010-2015 Lotus Interworks Inc. (“LIW”) Proprietary and Trade Secret.
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

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
    this.init();
}

//Inheriting from the base object
LeftMenu.prototype = Object.create(BasicMenu.prototype);


LeftMenu.prototype.init = function() {
    this.menu.set('bodyContent','<div class="leftmenu-container"></div>');

    this.Y.one("#" + this.parentPanel.panel.get('id') + " .checklistmenuleft").on("click", function(){
        //Ensuring that the menu option is displayed on top of the parent panel;
        this.menu.set("zIndex", this.parentPanel.panel.get("zIndex") + 1);

        this.menu.align("#" + this.parentPanel.panel.get('id') + ' span.alignleft.mainpanel_option.checklistmenuleft',
            [this.Y.WidgetPositionAlign.TL, this.Y.WidgetPositionAlign.CC]);

        this.menu.show();
    },this);
};

LeftMenu.prototype.createMenuTree = function(treeDiv) {
    (function(main, tDiv) {
        $('#' + treeDiv).fancytree(
            {
                selectMode: 3,
                icons: false,
                click: function(event, data) {
                    if(data.targetType == "title") {
                        if(typeof main.handleTreeClick !== "undefined") {
                            main.handleTreeClick(event, data);
                        }
                        if(data.node.hasChildren()) {

                            //var treeObj = data.node.tree;
                            var treeObj = $('#' + tDiv).fancytree("getTree");
                            treeObj.options.checkbox = treeObj.options.checkbox ? false : true;
                            treeObj.reload().done(function(){
                                $('#' + tDiv).fancytree("getTree").visit(function(node){
                                    node.setExpanded(true);
                                });
                            });
                        }
                        else {
                            $('#' + data.node.key).trigger("click");
                        }
                        return false;
                    }

                }
            }
        );
    })(this, treeDiv);
    $('#' + treeDiv).fancytree("getTree").visit(function(node){
        node.setExpanded(true);
    });
};

LeftMenu.prototype.createTreeFromData = function(data) {
    console.log('createTreeFromData', data);
    this.parseFileData(data.data.Items);
    console.log('parsedFileData', this.parsedFileData);
    this.treeSource = [];
    this.treeSource = this.createTreeSource(this.parsedFileData);

    console.log(this.treeSource);
    var treeDiv = this.leftMenuTree;
    (function(main, tDiv) {
        $('#' + treeDiv).fancytree(
            {
                source: main.treeSource,
                selectMode: 3,
                icons: false,
                click: function(event, data) {
                    if(data.targetType == "title") {
                        if(typeof main.handleTreeClick !== "undefined") {
                            main.handleTreeClick(event, data);
                        }
                        if(data.node.hasChildren()) {

                            //var treeObj = data.node.tree;
                            var treeObj = $('#' + tDiv).fancytree("getTree");
                            treeObj.options.checkbox = treeObj.options.checkbox ? false : true;
                            treeObj.reload().done(function(){
                                $('#' + tDiv).fancytree("getTree").visit(function(node){
                                    node.setExpanded(true);
                                });
                            });
                        }
                        else {
                            $('#' + data.node.key).trigger("click");
                        }
                        return false;
                    }

                }
            }
        );
    })(this, treeDiv);
    $('#' + treeDiv).fancytree("getTree").visit(function(node){
        node.setExpanded(true);
    });

};

LeftMenu.prototype.parseFileData = function(fileData) {
    this.parsedFileData = {};
    for(var i = 0; i < fileData.length; i++){
        //console.log('path:' + fileData[i].fullpath);
        var folderExp = /^([^\x7F]+)\x7F(.+)$/;
        var pathNodes = [];
        var matches = folderExp.exec(fileData[i].Edge.S);
        if(matches) {
            var lastObj = this.parsedFileData;
            while (matches) {
                //console.log('matches', matches);
                //console.log('lastObj:', lastObj);
                if (typeof lastObj[matches[1]] === "undefined") {
                    //console.log('empty object for ' + matches[1]);
                    lastObj[matches[1]] = {};
                }
                pathNodes.push(matches[1]);
                var newObj = lastObj[matches[1]];
                //console.log('newObj:', newObj );
                var newMatches = folderExp.exec(matches[2]);
                if (!newMatches) {
                    //console.log(lastObj[matches[1]]);
                    if (typeof lastObj[matches[1]].treeChildren === "undefined") {
                        lastObj[matches[1]].treeChildren = new Array();
                    }
                    fileData[i].name = matches[2];
                    fileData[i].paths = pathNodes;
                    lastObj[matches[1]].treeChildren.push(fileData[i]);
                }
                lastObj = newObj;
                //console.log('lastObj-end:', lastObj);
                matches = newMatches
            }
        }
    }
    //console.log(this.parsedFileData);
};

LeftMenu.prototype.createTreeSource = function(node) {
    var tree = [];
    for (var i in node) {
        if(i == 'treeChildren') {
            for(var i = 0; i < node.treeChildren.length; i++) {
                var nodeData = {"title": node.treeChildren[i].name, "key": node.treeChildren[i].Path.S};
                //var nodeData = {"title": node.treeChildren[i].name, "key": node.treeChildren[i].fullpath};
                tree.push(nodeData);
            }
        }
        else {
            var nodeData = {"title": i, "key": i, "folder": true, children: this.createTreeSource(node[i])};
            tree.push(nodeData);
        }
    }

    return tree;
};
