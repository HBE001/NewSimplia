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
 * Created by yahya on 9/28/15.
 */

function JSONEditorPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    //Default title
    this.panelTitle = "JSON Editor";

    this.GUID;
    this.isFinal = false;

    this.openExistingDraftURL = "./jsoneditorservices/openExistingDraft";
    this.openExistingFinalURL = "./jsoneditorservices/openExistingFinal";
    this.saveAsDraftURL = "./jsoneditorservices/saveAsDraft";
    this.saveAsFinalURL = "./jsoneditorservices/saveAsFinal";
    this.describeBFSTTableURL = "./jsoneditorservices/describeTable";

    /*creating two editors*/
    this.editor;
    //this.editor2;


    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
JSONEditorPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Essential initialization function that should always be called by the panel loader utility. Also, it's imperative to call the base class (which may not be BasicPanel always) init function in it
 * @param cb
 */
JSONEditorPanel.prototype.init = function (cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    var that = this;

    BasicPanel.prototype.init.call(this, function () {
        $.getScript("./js/sunny_jsoneditor.js", function () {
            console.log("Sunny JSON Editor Loaded");
            that.createJsonEditor();

            that.setupRoledRightMenu();
            if (typeof cb !== "undefined") {
                cb();
            }
        });
    });
};

/**
 * Overloaded function to add items to the right menu - it's called part of the initialization cycle. Items to the right menu can be added later as well.
 */
JSONEditorPanel.prototype.setupRightMenu = function () {
    //Always call the base class's function
    BasicPanel.prototype.setupRightMenu.call(this);
};

JSONEditorPanel.prototype.setupRoledRightMenu = function () {
    /*-------------------------------------------------------------*/
    /* Remove default Close button*/
    $('#' + this.rightMenu.menu.get('id')).find('.rightmenu-container ul li:last-child').remove();
    /*-------------------------------------------------------------*/

    //this._addTransition();
    this._newOption();
    //this._openExistingDraft();
    //this._openExistingFinal();
    //this._saveAsDraft();
    //this._saveAsFinal();
    this._saveCurrent();
    //this._addDescribeTableItems();
    /*-------------------------------------------------------------*/
    /* Add our new Close Button*/
    var that = this;
    this.addRightMenuItem("Close", function () {
        //that.saveEpisode(whiteboardApp.getCurrentWork());
        that.hidePanel();
        //that.hideAllMenus();
    }, true);
};

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
JSONEditorPanel.prototype.createJsonEditor = function () {
    var that = this;
    /*creating two editors*/
    this.editor = new JSONEditor($("#" + that.panel.get('id') + " .yui3-widget-bd .jsoneditor")[0]);
    //this.editor2 = new JSONEditor($(".jsoneditor2")[0]);

    /*Making the second editor to be of type text inorder to display the JSON*/
    //this.editor2.setMode('text');
    //var value = (this.jsonValue == undefined || this.jsonValue == '' ? {} : this.jsonValue)
    that.editor.set((this.jsonValue == undefined || this.jsonValue == '' ? {} : this.jsonValue));
    //that.editor2.set(that.editor.get());
    this.editor.focus();
    // --------------------- Setting Up Real Dimension -----------------------------------
    console.log("set Real Dimension");
    //$("#" + that.panel.get('id') + " .yui3-widget-bd")
    //    .css("height", $("#" + that.panel.get('id') + " .yui3-widget-bd").height()
    //    + $(".jsoneditor").height());
};
JSONEditorPanel.prototype.changeMode = function (mode) {
    console.log("changeMode", mode);
};

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
JSONEditorPanel.prototype._newOption = function () {
    var that = this;
    this.addRightMenuItem("New", function () {
        that.editor.set({});
        //that.editor2.set({});
        that.GUID = "";
    }, true);
};

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
JSONEditorPanel.prototype._openExistingDraft = function () {
    var that = this;
    this.addRightMenuItem("Open Existing Draft", function () {
        console.log(that.editor.get());
        $.ajax({
            url: that.openExistingDraftURL,
            method: 'POST',
            dataType: "json",
            data: {
                nodeGUID: that.GUID,
            }
        }).success(function (data) {
            /*after the req is served then set the data to the editors*/
            console.log("Data = ", data);
            that.editor.set(data);
            //that.editor2.set(data);
            that.isFinal = false;
        }).error(function (data) {
            console.log("Error = ", data);
        });
        that.rightMenu.menu.show();
    }, true);
}

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
JSONEditorPanel.prototype._openExistingFinal = function () {
    var that = this;
    this.addRightMenuItem("Open Existing Final", function () {
        console.log(that.editor.get());
        $.ajax({
            url: that.openExistingFinalURL,
            method: 'POST',
            dataType: "json",
            data: {
                nodeGUID: that.GUID,
            }
        }).success(function (data) {
            /*after the req is served then set the data to the editors*/
            console.log("Data = ", data);
            that.editor.set(data);
            //that.editor2.set(data);
            that.isFinal = true;
        }).error(function (data) {
            console.log("Error = ", data);
        });
        that.rightMenu.menu.show();
    }, true);
}

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
JSONEditorPanel.prototype._saveAsDraft = function () {
    var that = this;
    this.addRightMenuItem("Save as Draft", function () {
        var nodeGUID = that.GUID;
        if (that.isFinal) {
            nodeGUID = "";
        }
        $.ajax({
            url: that.saveAsDraftURL,
            method: 'POST',
            dataType: "json",
            data: {
                nodeGUID: nodeGUID,
                jsonData: JSON.stringify(that.editor.get()),
            }
        }).success(function (data) {
            console.log("In Case of Success");
            console.log(data);
            if (data.nodeId != undefined && data.nodeId != "") {
                that.GUID = data.nodeId;
            }
        }).error(function (error) {
            console.log('error');
            console.log(error);
        });
        that.rightMenu.menu.show();
    }, true);
}

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
JSONEditorPanel.prototype._saveAsFinal = function () {
    var that = this;
    this.addRightMenuItem("Save as Final", function () {
        console.log(that.editor.get());
        $.ajax({
            url: that.saveAsFinalURL,
            method: 'POST',
            dataType: "json",
            data: {
                jsonData: JSON.stringify(that.editor.get())
            }
        }).success(function (data) {
            console.log("In Case of Success");
            console.log(data);
            that.GUID = data.nodeId;
            localStorage["bfst_guid"] = that.GUID;
        }).error(function (data) {
            console.log('error');
            console.log(error);
        });
        that.rightMenu.menu.show();
    }, true);
}
/*----------------------------------------------------------*/
/**
 *
 * @private
 */
JSONEditorPanel.prototype._saveCurrent = function () {
    var that = this;
    this.addRightMenuItem("Save Current", function () {
        console.log(that.editor.get());
        that.parentCallBack(that.editor.get());
        that.rightMenu.menu.show();
    }, true);
}
/*----------------------------------------------------------*/
/**
 *
 * @private
 */
JSONEditorPanel.prototype._addDescribeTableItems = function () {
    var that = this;
    this.addRightMenuItem("Describe Table", function () {

        $.ajax({
            url: that.describeBFSTTableURL,
            type: "POST",
            dataType: "json",
            success: function (data) {
                console.log("In Case of Success");
                console.log(data);
            },
            error: function (error) {
                console.log('error');
                console.log(error);
            }
        })

        that.rightMenu.menu.show();
    }, true);
}

///*----------------------------------------------------------*/
///**
// *
// * @private
// */
//JSONEditorPanel.prototype._addTransition = function () {
//    var that = this;
//    this.addRightMenuItem("Add Transition", function () {
//        that.jsonValue = that.editor.get();
//
//        // ------------------ Create StateInput JSON ------------------------
//        var stateInput_stateJSON;
//        var stateInput_inputJSON;
//
//        if (that.stateInputJSON['StateInput'] === undefined) {
//            stateInput_stateJSON = {};
//            stateInput_inputJSON = {};
//        } else {
//            stateInput_stateJSON = that.stateInputJSON['StateInput'];
//            if (stateInput_stateJSON[that.jsonValue['Current_State']] === undefined) {
//                stateInput_inputJSON = {};
//            } else {
//                stateInput_inputJSON = stateInput_stateJSON[that.jsonValue['Current_State']];
//            }
//        }
//
//        stateInput_inputJSON[that.jsonValue['Input']] = {
//            "Output": that.jsonValue['Output'],
//            "Next_State": that.jsonValue['Next_State'],
//            "Cycle": that.jsonValue['Cycle']
//        };
//        stateInput_stateJSON[that.jsonValue['Current_State']] = stateInput_inputJSON;
//        that.stateInputJSON = {'StateInput': stateInput_stateJSON};
//
//        // ------------------ Create RoleState JSON ------------------------
//        var roleState_roleJSON;
//        var roleState_stateJSON;
//
//        if (that.roleStateJSON['RoleState'] === undefined) {
//            roleState_roleJSON = {};
//            roleState_stateJSON = {};
//            roleState_stateJSON[that.jsonValue['Current_State']] = [];
//        } else {
//            roleState_roleJSON = that.roleStateJSON['RoleState'];
//            if (roleState_roleJSON[that.jsonValue['Role']] === undefined) {
//                roleState_stateJSON = {};
//            } else {
//                roleState_stateJSON = roleState_roleJSON[that.jsonValue['Role']];
//            }
//            if (roleState_stateJSON[that.jsonValue['Current_State']] === undefined) {
//                roleState_stateJSON[that.jsonValue['Current_State']] = [];
//            }
//        }
//        if (roleState_stateJSON[that.jsonValue['Current_State']].indexOf(that.jsonValue['Input']) == -1) {
//            roleState_stateJSON[that.jsonValue['Current_State']].push(that.jsonValue['Input']);
//        }
//        roleState_roleJSON[that.jsonValue['Role']] = roleState_stateJSON;
//        that.roleStateJSON = {'RoleState': roleState_roleJSON};
//
//        // ---------------------------------------------------------------------------
//        // ---------------------------------------------------------------------------
//        //that.parentPanel.stateInputJSON = that.stateInputJSON;
//        //that.parentPanel.roleStateJSON = that.roleStateJSON;
//        //that.parentPanel.currentState = that.currentState;
//        //that.parentPanel.currentRole = that.currentRole;
//        //
//        //that.parentPanel.setupBFSTMachine(that.currentState, that.currentRole);
//        // ---------------------------------------------------------------------------
//        // ---------------------------------------------------------------------------
//        //that.editor1.set($.extend(that.stateInputJSON, that.roleStateJSON));
//    }, true);
//};

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
JSONEditorPanel.prototype.syntaxHighlight = function (json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}