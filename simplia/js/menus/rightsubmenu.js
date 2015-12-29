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

function RightSubMenu(Y, properties) {
    //Calling baste constructor
    BasicMenu.call(this, Y);

    this.isActive = false;

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
    this.init();
}

//Inheriting from the base object
RightSubMenu.prototype = Object.create(BasicMenu.prototype);

RightSubMenu.prototype.init = function () {
    var that = this;
    this.menu.set('headerContent', '<div class="header-title"><span class="' + that.subMenuTitle.toLowerCase().replace(" ", "_") + '"><span class="panel-title">' + that.subMenuTitle + '</span>' +
        '<span class="arrow"><span><span class="submenu_arrowdown" style="cursor: pointer;">&#9650;&nbsp;&nbsp;<span/><span/><span/></span></span></span></span></div>');

    this.menu.set('bodyContent', '<div class="rightmenu-container"><ul></ul></div>');
    this.menu.set("zIndex", this.parentMenu.menu.get("zIndex") + 1);

    this.Y.all(".header-title ." + that.subMenuTitle.toLowerCase().replace(" ", "_") + " .submenu_arrowdown").on("click", function () {
        if (that.isActive) {
            that.deactivate();
            if (that.isParentSubMenu) {
                that.parentMenu.activate();
            } else {
                that.parentMenu.menu.show();
            }
        }
    }, this);
};

RightSubMenu.prototype.addMenuItem = function (menuLabel, callback, addToEnd, centralize) {
    if (typeof addToEnd !== "undefined" && addToEnd) {
        var ulStr = "<li style=\"text-align: center;\">" + menuLabel + "</li>";
    }else{
        var ulStr = "<li>" + menuLabel + "</li>";
    }
    var ulElem = $('#' + this.menu.get('id')).find('.rightmenu-container ul');
    var that = this;

    if (typeof addToEnd !== "undefined" && addToEnd) {
        $(ulStr).appendTo(ulElem).each(function () {
            $(this).click(function () {
                that.removeHighLightMenuItem();
                $( this ).css( "color", "#0072C5;" );
                callback();
            });
        });
    }

    else {
        $(ulStr).prependTo(ulElem).each(function () {
            $(this).click(function () {
                that.removeHighLightMenuItem();
                $( this ).css( "color", "#0072C5;" );
                callback();
            });
        });
    }
};

RightSubMenu.prototype.highlightMenuItem = function (itemToHighlight) {
    $('#' + this.menu.get('id')).find('.rightmenu-container ul').each(function () {
        $($(this).find('li')).each(function () {
            if ($(this).html() == $(itemToHighlight)[0]){
                $(this).css( "color", "#0072C5;" );
            }
        });
    });
}

RightSubMenu.prototype.highlightMenuItemIndex = function (index) {
    var i = 0;
    $('#' + this.menu.get('id')).find('.rightmenu-container ul').each(function () {
        $($(this).find('li')).each(function () {
            if (i++ == index){
                $(this).css( "color", "#0072C5;" );
                return;
            }
        });
    });
}


RightSubMenu.prototype.removeHighLightMenuItem = function () {
    $('#' + this.menu.get('id')).find('.rightmenu-container ul').each(function () {
        //var list = $(this).find('li');
        $($(this).find('li')).each(function () {
           $(this).css( "color", "" );
        });
    });
}

RightSubMenu.prototype.removeAllMenuItems = function () {
    $('#' + this.menu.get('id')).find('.rightmenu-container ul').html("");
}

RightSubMenu.prototype.activate = function () {
    this.showMenu();
    this.isActive = true;
}

RightSubMenu.prototype.deactivate = function () {
    this.hideMenu();
    this.isActive = false;
}