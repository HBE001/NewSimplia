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
 * Panel class based off of BasicDatabaseFormDatatablePanel that's used to display datatbase row data without any provision for editing
 * @param {Object} Y - Global YUI Object
 * @param {Object} properties -  panel attributes
 * @constructor
 */
function DynamoDBViewFormDatatablePanel(Y, properties) {
    //Calling base constructor
    DynamoDBBasicDatabaseFormDatatablePanel.call(this, Y);

    //Put the default value
    this.formMode = 'readonly';

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
DynamoDBViewFormDatatablePanel.prototype = Object.create(DynamoDBBasicDatabaseFormDatatablePanel.prototype);

/**
 * The initialization function that simply calls the base class's init function
 * @param cb
 */
DynamoDBViewFormDatatablePanel.prototype.init = function(cb) {
    DynamoDBBasicDatabaseFormDatatablePanel.prototype.init.call(this, cb || undefined);

    //this._addWhiteBoardPanel();
};

/* ------------------------------------------------------------- */
DynamoDBViewFormDatatablePanel.prototype._addWhiteBoardPanel = function() {
    var that = this;
    this.addChildPanel('whiteboardpanel', 'whiteboard', {panelTitle: "Whiteboard", parentPanel: this}, function(error, panel){
        if(error) {
            console.log(error);
            return;
        }

        that.addRightMenuItem("Add Whiteboard", function(){
            panel.showPanel();
            panel.bringToTop(that);
            panel.startWhiteboard();
            panel.alignOverParent();
        });
    });
};
