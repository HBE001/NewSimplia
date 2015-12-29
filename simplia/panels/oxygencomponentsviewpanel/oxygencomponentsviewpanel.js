/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * ? 2010-2015 Lotus Interworks Inc. (?LIW?) Proprietary and Trade Secret.
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
 * A simple example for a panel derived from BasicPanel class
 * @param Y
 * @param properties
 * @constructor
 */
function OxygenComponentsViewPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);
    //Default title
    this.panelTitle = "Oxygen Component";
    this.custom = false;
    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
OxygenComponentsViewPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Essential initialization function that should always be called by the panel loader utility.
 * Also, it's imperative to call the base class (which may not be BasicPanel always) init function in it
 * @param cb
 */
OxygenComponentsViewPanel.prototype.init = function (cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    var that = this;
    BasicPanel.prototype.init.call(this, function () {
        console.log("that.custom = ", that.custom);
        if (!that.custom) {
            $.ajax({
                //url: '/oxygencomponentsview/loadOxygenComponents/' + that.getUrlParameter('router'),
                url: '/oxygencomponentsview/loadOxygenComponents/' + that.getUrlParameter('gdn'),
                method: 'GET'
            }).success(function (loadedJSON) {
                $(".panel-title").html(that.getUrlParameter('context'));
                that.addChildPanel('contextviewerpanel', 'contextviewerpanel', {
                    panelTitle: that.getUrlParameter('gdn'),
                    parentPanel: that,
                    targetedContent: JSON.parse(JSON.stringify(loadedJSON[that.getUrlParameter('context')])) /* to pass by value not by reference value */,
                    fullComponent: JSON.parse(JSON.stringify(loadedJSON)) /* to pass by value not by reference value */,
                    referenceComponent: loadedJSON[that.getUrlParameter('context')]
                    //jsonValue: $('#txt_' + button_uid).val()
                }, function (error, panel) {
                    if (error) {
                        console.log(error);
                    } else {
                        panel.showPanel();
                        panel.bringToTop(that);
                    }
                });
                //
                //
                //if (loadedJSON.Code != undefined && loadedJSON.Code.ApplicationClientCode != undefined) {
                //    eval(loadedJSON.Code.ApplicationClientCode.code);
                //} else {
                //    console.log("Returning Code is undefined");
                //}
            }).error(function (data) {
                alert(data);
            });
        } else {
            //that._addSaveCurrentOption();
        }
        //$.getScript("https://cdnjs.cloudflare.com/ajax/libs/jquery-timepicker/1.8.1/jquery.timepicker.min.js");
        if (typeof cb !== "undefined") {
            cb();
        }
    });
};

OxygenComponentsViewPanel.prototype._addSaveCurrentOption = function (loadedJSON) {
    var that = this;
    this.addRightMenuItem("Save Current", function () {

        var formValues = {};
        $("#displayEditor").each(function () {
            $(this).find(':input').each(function () {
                    formValues[$(this).attr("name")] = $(this).val();
                    console.log($(this).attr("name"), " = ", $(this).val());
                }
            );
        });
        if (that.parentCallBack != undefined) {
            console.log("Parent Call Back = ", that.parentCallBack);
            that.parentCallBack(formValues);
        } else {
            console.log("Parent Callback is undefined");
        }
    });
};

OxygenComponentsViewPanel.prototype.viewAsHTML = function (loadedJSON) {
    $('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.0/css/bootstrap-datepicker.min.css">');
    $.getScript('https://cdnjs.cloudflare.com/ajax/libs/jquery-timepicker/1.8.1/jquery.timepicker.min.js');
    var transform;
    var neededData;
    if (loadedJSON == undefined || loadedJSON.ApplicationClientTemplate == undefined || loadedJSON.ApplicationClientTemplate.schema == undefined) {
        transform = {};
    } else {
        transform = JSON.parse(loadedJSON.ApplicationClientTemplate.schema);
    }

    if (loadedJSON == undefined || loadedJSON.ApplicationClientData == undefined || loadedJSON.ApplicationClientData.data == undefined) {
        neededData = {};
    } else {
        neededData = JSON.parse(loadedJSON.ApplicationClientData.data);
    }

    $.ajax({
        url: '/oxygencomponentsview/dataTransformForm',
        method: 'POST',
        data: {
            transform: transform,
            neededData: neededData
        }
    }).success(function (transformation) {
        console.log(transformation);
        $('#displayEditor').html(transformation);
        $('#displayEditor').submit(function (e) {
            e.preventDefault();
        });
    }).error(function (error) {
        alert(error);
    });
};

OxygenComponentsViewPanel.prototype.getUrlParameter = function (sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};


/**
 * Overloaded function to add items to the right menu - it's called part of the initialization cycle. Items to the right menu can be added later as well.
 */
OxygenComponentsViewPanel.prototype.setupRightMenu = function () {
    //Always call the base class's function
    BasicPanel.prototype.setupRightMenu.call(this);
};
