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

function ScreenManager(Y, config) {
	//Initialization code
	this.Y = Y;
	this.panels = {};
    this.panelsArray = [];
    this.panelsIndex = {};
	this.pLoader = new PanelLoader(this.Y, "panels/");
    this.initialZIndex = 1;
    this.panelsParentDiv = "panels";
    this.menusParentDiv = "menus";

    this.nextPanelCoords = [0,0];

    if(typeof config === "object") {
        $.extend(this, config);
    }
}

ScreenManager.prototype.getNextZIndex = function() {
    return this.initialZIndex++;
};

ScreenManager.prototype.addPanel = function(panel) {
    var panelId = panel.getPanelId();
	this.panels[panelId] = panel;
    this.panelsIndex[panelId] = this.panelsArray.push(panelId) - 1;

};

ScreenManager.prototype.getPanel = function(panelName) {
	return this.panels[panelName] || null;
};

ScreenManager.prototype.hidePanels = function() {
	for(var panelName in this.panels) {
		this.panels[panelName].visible = this.panels[panelName].panel.panel.get('visible');
		this.panels[panelName].xy = this.panels[panelName].panel.panel.get('xy');
		this.panels[panelName].panel.panel.hide();
	}
};

ScreenManager.prototype.showPanels = function() {
	for(var panelName in this.panels) {
		if(this.panels[panelName].visible) {
			this.panels[panelName].panel.panel.show();
			this.panels[panelName].panel.panel.move(this.panels[panelName].xy[0], this.panels[panelName].xy[1]);
		}
	}
};


ScreenManager.prototype.maximizePanels = function() {
	for(var panelName in this.panels) {
		var panelContainerName = this.panels[panelName].container;
		this.panels[panelName].panel.maximizePanel();
	}
};

ScreenManager.prototype.minimizePanels = function() {
	for(var panelName in this.panels) {
		var panelContainerName = this.panels[panelName].container;
		this.panels[panelName].panel.minimizePanel();
	}
};

ScreenManager.prototype.getMousePosition = function(e) {
	var _x;
	var _y;
	var isIE = document.all ? true : false;

	if (!isIE) {
		_x = e.pageX;
		_y = e.pageY;
	}
	if (isIE) {
		_x = event.clientX + document.body.scrollLeft;
		_y = event.clientY + document.body.scrollTop;
	}
	return [_x, _y];
};

ScreenManager.prototype.stackPanels = function(topPos) {
	for(var panelName in this.panels) {
		if(this.panels[panelName].panel.panel.get('visible')) {

			this.panels[panelName].panel.panel.move(0,topPos);

			var panelContainerName = this.panels[panelName].container;
			this.panels[panelName].panel.minimizePanel();
			var panelHeaderHeight = $("#"+ panelContainerName).find('.header-title').parent().height();
			topPos += panelHeaderHeight;
		}
	}

};


ScreenManager.prototype.initializePanel = function(panelName, properties, callback){
    var that = this;
    this.pLoader.initializePanel(panelName, properties, function(error, panel){
        if(error) {
            return callback(error);
        }
        panel.init(function(){
            that.addPanel(panel);
            that.alignNewPanel(panel);
            callback(error, panel);
         });
    });
};

ScreenManager.prototype.alignNewPanel = function(panel) {
    panel.callPanel("set","xy",this.nextPanelCoords);
    var panelElem = $('#' + panel.getPanelId());

    this.nextPanelCoords[0] = panelElem.offset().left + panelElem.width();
};

ScreenManager.prototype.showPanel = function(panelName) {
	var panelObj;
	if(panelObj = this.getPanel(panelName)) {
		panelObj.panel.showPanel();
	}
	else {
		this.initializePanel(panelName, true);
	}
};

ScreenManager.prototype.getPanelsParentDiv = function() {
    return this.Y.one('#' + this.panelsParentDiv);
};

ScreenManager.prototype.getMenusParentDiv = function() {
    return this.Y.one('#' + this.menusParentDiv);
};