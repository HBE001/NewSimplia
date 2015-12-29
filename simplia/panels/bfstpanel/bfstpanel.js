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

function BFSTPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    //Default title
    this.panelTitle = "BSFT Panel";

    this.GUID = localStorage["bfst_guid"];
    if (this.GUID == undefined || this.GUID == "") {
        //2015-09-30T08:14:36.823063Z000-0000Z // mini
        //2015-09-30T09:24:43.129028Z000-0000Z // Full
        this.GUID = "2015-09-30T09:24:43.129028Z000-0000Z";
    }

    this.describeBFSTTableURL = "./bfstservices/describeTable";
    this.saveJSONToDBURL = "./bfstservices/savebfstinstance";
    this.getBFSTInstanceURL = "./bfstservices/getbfstinstance";
    this.updateBFSTInstanceURL = "./bfstservices/updatebfstinstance";

    this.jsonValue = {};
    this.stateInputJSON = {};
    this.roleStateJSON = {};
    this.currentState = "";
    this.currentRole = "";

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
BFSTPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Essential initialization function that should always be called by the panel loader utility. Also, it's imperative to call the base class (which may not be BasicPanel always) init function in it
 * @param cb
 */
BFSTPanel.prototype.init = function (cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    var that = this;

    BasicPanel.prototype.init.call(this, function () {
        that.setupButtonsListeners();
        that.setupRoledRightMenu();

        if (typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 * Overloaded function to add items to the right menu - it's called part of the initialization cycle. Items to the right menu can be added later as well.
 */
BFSTPanel.prototype.setupRightMenu = function () {
    //Always call the base class's function
    BasicPanel.prototype.setupRightMenu.call(this);
};

BFSTPanel.prototype.setupRoledRightMenu = function () {
    /*-------------------------------------------------------------*/
    /* Remove default Close button*/
    $('#' + this.rightMenu.menu.get('id')).find('.rightmenu-container ul li:last-child').remove();
    /*-------------------------------------------------------------*/

    this._addJSONEditorPanel();
    /*-------------------------------------------------------------*/
    /* Add our new Close Button*/
    var that = this;
    this.addRightMenuItem("Close", function () {
        that.saveEpisode(whiteboardApp.getCurrentWork());
        that.hidePanel();
        that.hideAllMenus();
    }, true);
};
/*----------------------------------------------------------*/
/**
 *
 * @private
 */
BFSTPanel.prototype._addJSONEditorPanel = function () {
    var that = this;
    this.addChildPanel('jsoneditorpanel', 'jsoneditorpanel', {
        panelTitle: "JSON Editor",
        parentPanel: this
    }, function (error, panel) {
        if (error) {
            console.log(error);
            return;
        }
        that.addRightMenuItem("Open JSON Editor", function () {
            panel.showPanel();
            panel.bringToTop(that);
        }, true);
    });
}

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
BFSTPanel.prototype.setupButtonsListeners = function () {
    var that = this;
    $('#' + this.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + ' .run').on('click', function () {
        var resultValues = that.stateInputJSON['StateInput'][$('#' + that.panel.get('boundingBox').get('id')
            + ' .yui3-widget-bd' + " select[name*='root[Current_State]']").val()][$('#' + that.panel.get('boundingBox').get('id')
            + ' .yui3-widget-bd' + " select[name*='root[Input]']").val()];
        console.log("Run ==>> ");
        console.log(resultValues);
        console.log(that.stateInputJSON);
        console.log(that.roleStateJSON);
        console.log($('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Current_State]']").val());
        console.log($('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Input]']").val());
        if (resultValues !== undefined) {
            $('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " input[name*='root[Output]']").val(resultValues['Output']);
            $('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " input[name*='root[Next_State]']").val(resultValues['Next_State']);
            $('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " input[name*='root[Cycle]']").val(resultValues['Cycle']);
            // -------------------------------------------------------
            that.currentState = resultValues['Next_State'];
            that.currentRole = $('#' + that.panel.get('boundingBox').get('id')
                + ' .yui3-widget-bd' + " select[name*='root[Role]']").val();
        }
    });
}

/*----------------------------------------------------------*/
/**
 *
 * @private
 */

BFSTPanel.prototype.setupBFSTMachine = function (currentState, currentRole) {
    var that = this;
    var statesArray = [];
    var rolesArray = [];
    var inputArray = [];


    if (this.stateInputJSON['StateInput'] !== undefined) {
        statesArray = [];
        for (var state in this.stateInputJSON['StateInput']) {
            statesArray.push(state);
        }
    }

    if (this.roleStateJSON['RoleState'] !== undefined) {
        rolesArray = [];
        for (var role in this.roleStateJSON['RoleState']) {
            rolesArray.push(role);
        }
    }

    if (currentState == "") {
        currentState = statesArray[0];
        this.currentState = currentState;
    }
    if (currentRole == "") {
        currentRole = rolesArray[0];
        this.currentRole = currentRole;
    }

    if (this.roleStateJSON['RoleState'][currentRole] !== undefined
        && this.roleStateJSON['RoleState'][currentRole][currentState] != undefined) {
        inputArray = [];
        inputArray = this.roleStateJSON['RoleState'][currentRole][currentState];
    }

    // ----------------------------------------------------------------
    $('#' + this.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Current_State]']")
        .empty()
        .append('<option value="undefined"></option>');
    $.each(statesArray, function (value) {
        $('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Current_State]']")
            .append($("<option></option>")
                .attr("value", statesArray[value])
                .text(statesArray[value]));
    });
    $('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Current_State]']").val(currentState);

    // ----------------------------------------------------------------
    $('#' + this.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Role]']")
        .empty()
        .append('<option value="undefined"></option>');
    $.each(rolesArray, function (value) {
        $('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Role]']")
            .append($("<option></option>")
                .attr("value", rolesArray[value])
                .text(rolesArray[value]));
    });
    $('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Role]']").val(currentRole);

    // ----------------------------------------------------------------
    $('#' + this.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Input]']")
        .empty()
        .append('<option value="undefined"></option>');
    $.each(inputArray, function (value) {
        $('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Input]']")
            .append($("<option></option>")
                .attr("value", inputArray[value])
                .text(inputArray[value]));
    });

    // ----------------------------------------------------------------
    $('#' + this.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Current_State]']")
        .on('change', function () {
            console.log("State Changed");
            console.log($('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Current_State]']").val());
            console.log(that.currentState);

            if ($('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Current_State]']").val() != that.currentState) {
                that.setupBFSTMachine($('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Current_State]']").val(),
                    $('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Role]']").val());
            }
        });

    $('#' + this.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Role]']")
        .on('change', function () {
            console.log("Role Changed");
            console.log($('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Role]']").val());
            console.log(that.currentRole);

            if ($('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Role]']").val() != that.currentRole) {
                that.setupBFSTMachine($('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Current_State]']").val(),
                    $('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-bd' + " select[name*='root[Role]']").val());
            }
        });
}
