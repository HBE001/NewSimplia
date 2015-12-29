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
 * The general panel class to create datatables. All datatable panels MUST be derived from this class.
 * @param {Object} Y - Global YUI Object
 * @param {Object} properties - Panel attributes
 * @param {string} properties.panelTitle - Title to be displayed on the panel header
 * @constructor
 * @class
 */
function ContextViewerPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    //Default title
    this.panelTitle = "Datatable Panel";
    this.datatable = "";

    // expected to have those passed parameter while constructing the context view panel
    //{
    //    panelTitle: title, /* Title of the panel */
    //    parentPanel: that, /* Parent Panel, the oxygen component that have the context */
    //    targetedContext:JSON.parse(JSON.stringify(that.getFormValue(title).value)) /* the context to pass by value not by reference value */,
    //    fullComponent:JSON.parse(JSON.stringify(that.collectFormData(["tableName"]))) /* the full oxygen components to pass by value not by reference value */,
    //    referenceComponent: that.getFormValue(title).value, /* the full oxygen components passed by reference to update context values and add context data */
    //}

    // the middle layer that format the context, and provide the YUI datat tabel with properties to build it,
    // that properties will contain, Schema, Data, and other YUI data table
    this.jsonFormater;
    // The widget Container contains all the widgets that can be displayed on the view, the widget would be presented based on the TagArray
    this.widgetsContainer;

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
ContextViewerPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Initializes the datatable, along with the panel
 * @param {Function} cb - Callback to be executed once the datatable has been created
 */
ContextViewerPanel.prototype.init = function (cb) {
    var that = this;

    BasicPanel.prototype.init.call(this, function () {
        cb = cb || undefined;
        that._createDatatable(cb);
    });
};

/**
 * Main datatable creation function
 * @param {Function} cb - Callback function to be called after the creation of the datatable
 * @private
 */
ContextViewerPanel.prototype._createDatatable = function (cb) {
    var that = this;

    // loading the formatter and widget container JS files
    $.getScript('./js/JSONFormatter.js', function () {
        $.getScript('./js/WidgetsContainer.js', function () {
            var formattedJSON;
            // JSON Formater takes it's parent parameter to access it's values i.e. context, widgetContainer tag array
            // we can pass this values insted of passing the full parent
            that.jsonFormater = new JSONFormatter(that);

            // Widget Container take parent to access it's value, Y to add child panel if needed,
            // and dataTable panel to allow widgets manipulate with the form by setting and getting values
            that.widgetsContainer = new WidgetsContainer({
                parent: that,
                Y: (that.parentPanel == undefined ? that.Y : that.parentPanel.Y),
                datatable: that.datatable
            });
            that.transformSchema(cb);
        });
    })
};

ContextViewerPanel.prototype.transformSchema = function (cb) {
    var that = this;

    //  in the context we can have code that is running before and after building the dataTable
    // that code is executable based on Oxygen Component Meta type or what ever trigger we define
    // after running the code I get the formatted JSON to create the YUI Datatable also based on the Defined METATable
    if (that.fullComponent.Code && that.fullComponent.Code.schemaTransformer && that.fullComponent.Code.schemaTransformer[that.fullComponent.MetaType] && that.fullComponent.Code.schemaTransformer[that.fullComponent.MetaType].before) {
        eval(that.fullComponent.Code.schemaTransformer[that.fullComponent.MetaType].before);
    }

    that.jsonFormater.transformSchema(that.targetedContent, function (formattedJSON) {
        console.log("formattedJSON ======> ", formattedJSON);

        if (that.datatable != "" && that.datatable != undefined){
            $("#" + that.panel.get('id') + " .yui3-datatable-table").remove();
        }
        that.datatable = new that.Y.DataTable(formattedJSON);
        that.widgetsContainer.datatable = that.datatable;

        // We run the code after creating the YUI Datatable based on METAType
        if (that.fullComponent.Code && that.fullComponent.Code.schemaTransformer &&
            that.fullComponent.Code.schemaTransformer[that.fullComponent.MetaType] &&
            that.fullComponent.Code.schemaTransformer[that.fullComponent.MetaType].after) {
            eval(that.fullComponent.Code.schemaTransformer[that.fullComponent.MetaType].after);
        }

        if (typeof cb !== "undefined") {
            cb();
        }
    });
};