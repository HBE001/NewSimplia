function ScreenManager(Y) {
	//Initialization code
	this.Y = Y;
	this.panels = {};
	this.chatPanelSuffix = "-chatpanel";
	this.pLoader = new PanelLoader(this.Y, "panels/");

	
	this.init = function(config){
		if(config) {
			for(var i in config){
				if(typeof this[i] !== "undefined") {
					this[i] = config[i];
				}
			}
		}
	};
	
	
	
	this.addPanel = function(panelName, panel, containerName) {
		this.panels[panelName] = {panel: panel, container: containerName};
	};
	
	this.hidePanels = function() {
		for(var panelName in this.panels) {
			this.panels[panelName].visible = this.panels[panelName].panel.panel.get('visible');
			this.panels[panelName].xy = this.panels[panelName].panel.panel.get('xy');
			this.panels[panelName].panel.panel.hide();
		}		
	};
	
	this.showPanels = function() {
		for(var panelName in this.panels) {
			if(this.panels[panelName].visible) { 
				this.panels[panelName].panel.panel.show();
				this.panels[panelName].panel.panel.move(this.panels[panelName].xy[0], this.panels[panelName].xy[1]);
			}
		}		
	};
	

	this.maximizePanels = function() {
		for(var panelName in this.panels) {
			var panelContainerName = this.panels[panelName].container;
			this.panels[panelName].panel.maximizePanel();
		}
	};
	
	this.minimizePanels = function() {
		for(var panelName in this.panels) {
			var panelContainerName = this.panels[panelName].container;
			this.panels[panelName].panel.minimizePanel();
		}		
	};
	
	this.getMousePosition = function(e) {
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

	this.stackPanels = function(topPos) {
    	for(var panelName in this.panels) {
	    	if(this.panels[panelName].panel.panel.get('visible')) {
	    		
	    		this.panels[panelName].panel.panel.move(0,topPos);
	    		
	    		var panelContainerName = this.panels[panelName].container;
	    		this.panels[panelName].panel.minimizePanel();
	    		var panelHeaderHeight = $("#"+ panelContainerName).find('.header-title').parent().height();
	    		topPos += panelHeaderHeight;
	    	}	
    	}
		
	}
	
	this.initializePanels = function() {
        /*
        this.pLoader.loadPanel("chatpanel", roomName, {room_name:roomName}, function(panel){
                if(panel) {
                		//TODO: Change the roomname to something proper
                        panel.init({
                        	username: Y.userInfo.username, 
                        	userid: Y.userInfo.LID,
                        	roomname: roomName, 
                        	roomId: roomId,
                        	show: roomData.makeActive, 
                        	userrole: "moderator",
                        	showOptions: ((typeof Y.userInfo['showOptions'] !== "undefined") ? Y.userInfo['showOptions'] : "all"),
                        	extension: ((typeof Y.userInfo['extension'] !== "undefined") ? Y.userInfo.extension : ""),
                        	roomData: roomData
                        });
                        //panel.joinRoom(roomData);
                        //panel.setUsername(userInfo.accountName);
                }
        });



        this.pLoader.loadPanel("viewpropertiespanel",roomName, {room_name: roomName},function(panel){
                  if(panel){
                          panel.init();
                  }
          });

         this.pLoader.loadPanel("propertydetailspanel", roomName, {room_name: roomName}, function(panel){
                  if(panel){
                          panel.init();
                  }
          });
	
         this.pLoader.loadPanel("salesrespanel",roomName, {room_name: roomName}, function(panel){
                  if(panel){
                          panel.init();
                  }
          });

         this.pLoader.loadPanel("agreementpanel",roomName, {room_name: roomName}, function(panel){
                  if(panel){
                          panel.init();
                  }
          });


         this.pLoader.loadPanel("viewpostingspanel",roomName, {room_name: roomName}, function(panel){
                  if(panel){
                          panel.init();
                  }
          });


         this.pLoader.loadPanel("addpropertiespanel",roomName, {room_name: roomName}, function(panel){
                  if(panel){
                          panel.init();
                  }
          });


         this.pLoader.loadPanel("chromephonepanel",roomName, {room_name: roomName}, function(panel){
                  if(panel){
                          panel.init();
                  }
          });

         
         this.pLoader.loadPanel("uploaderpanel",roomName, {room_name: roomName}, function(panel){
             if(panel){
                     panel.init();
             }
     	});
     	

         this.pLoader.loadPanel("viewerpanel",roomName, {room_name: roomName}, function(panel){
             if(panel){
                     panel.init();
             }
     	});

         this.pLoader.loadPanel("accountsmanagementpanel",roomName, {room_name: roomName}, function(panel){
             if(panel){
                     panel.init();
             }
     	});

         this.pLoader.loadPanel("roomsmanagementpanel",roomName, {room_name: roomName}, function(panel){
             if(panel){
                     panel.init();
             }
     	});

         this.pLoader.loadPanel("invitespanel",roomName, {room_name: roomName}, function(panel){
             if(panel){
                     panel.init();
             }
     	});
         this.pLoader.loadPanel("communicationpanel",roomName, {room_name: roomName}, function(panel){
             if(panel){
                     panel.init();
             }
     	});
         
        */
        this.pLoader.loadPanel("addpropertiespanel",{}, function(panel){
            if(panel){
                panel.init();
            }
        });

	};
	
	
}
