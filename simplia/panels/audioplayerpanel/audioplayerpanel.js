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
 * A Media Player panel derived from BasicPanel class
 * @param Y
 * @param properties
 * @constructor
 */
function AudioPlayerPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    //Default title
    this.panelTitle = "Audio Player";
    this.source = properties.source;
    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
AudioPlayerPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Essential initialization function that should always be called by the panel loader utility.
 * Also, it's imperative to call the base class (which may not be BasicPanel always) init function in it
 * @param cb
 */
AudioPlayerPanel.prototype.init = function (cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    var that = this;

    BasicPanel.prototype.init.call(this, function () {
        var src = {
            src: that.source,
            type: "audio/mpeg"
        };

        that.loadSound(src);
        that.setupRoledRightMenu();
        if (typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 * Overloaded function to add items to the right menu - it's called part of the initialization cycle.
 * Items to the right menu can be added later as well.
 */
AudioPlayerPanel.prototype.setupRightMenu = function () {
    //Always call the base class's function
    BasicPanel.prototype.setupRightMenu.call(this);
};

/*---------------------------------------------------------------------------*/
/**
 *
 */
AudioPlayerPanel.prototype.setupRoledRightMenu = function () {
    /*-------------------------------------------------------------*/
    /* Remove default Close button*/
    $('#' + this.rightMenu.menu.get('id')).find('.rightmenu-container ul li:last-child').remove();
    /*-------------------------------------------------------------*/

    /* Add our new Close Button*/
    var that = this;
    this.addRightMenuItem("Close", function () {
        that._snd.pause();
        that._snd.currentTime = 0;

        that.hidePanel();
    }, true);
};
/*---------------------------------------------------------------------------*/
/**
 *
 */
AudioPlayerPanel.prototype.loadSound = function (src) {
    var that = this;

    this._snd = new Audio();

    var source = document.createElement('source');
    source.type = src.type;
    source.src = src.src;
    this._snd.appendChild(source);

    this.panel.addButton({
        value: 'Play',
        section: Y.WidgetStdMod.FOOTER,
        action: function (e) {
            e.preventDefault();
            console.log("Play");
            that._snd.load(); // Needed on safari / idevice
            that._snd.play();
        }
    });

    this.panel.addButton({
        value: 'Pause',
        section: Y.WidgetStdMod.FOOTER,
        action: function (e) {
            e.preventDefault();
            console.log("Pause");
            that._snd.pause();
        }
    });

    $('#' + that.panel.get('boundingBox').get('id') + ' .yui3-widget-ft').css('text-align', 'center');

}