/**
 * Created by yahya on 8/9/15.
 */
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

function BasicNotification(Y, properties) {
    this.Y = Y;

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
    //this.AlignNotifications();
}

BasicNotification.prototype.AlignNotifications = function() {
    var top = $("#" + this.parentPanel.panel.get('id')).position().top + 40;
    var left = $("#" + this.parentPanel.panel.get('id')).position().left + 10;

    $("#" + this.Y.notify.get('id')).css("right", "auto").css("top", top + "px").css("left", left + "px").css("opacity", "0.7");
};

//BasicNotification.prototype.AlignNotifications = function (selector, coordsArray) {
//    this.Y.notify.align(selector, coordsArray);
//};



BasicNotification.prototype.showMessage = function(message, timeOut) {
    //this.AlignNotifications('#' + this.parentPanel.panel.get('boundingBox').get('id') + ' .yui3-widget-bd', [this.Y.WidgetPositionAlign.TL, this.Y.WidgetPositionAlign.TL]);
    this.AlignNotifications();

    console.log("Want to show Message");
    console.log(message);

    this.Y.notify.add({
        message  : message,
        timeout  : timeOut,
        flag     : 'Not Read',
    });

    console.log("Message Seen");
    console.log(message);
};

BasicNotification.prototype.hideMessage = function() {
};
