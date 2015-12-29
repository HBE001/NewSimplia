function CommunicationManager(Y) {
	//Initialization code
	this.Y = Y;
	this.socket = "";
	this.messageEventSuffix = "-messageevent";
	this.mainMessageEvent = "messageevent"
}

CommunicationManager.prototype.init = function(config) {
    for(var i in config){
        if(typeof this[i] !== "undefined") {
            this[i] = config[i];
        }
    }

    var that = this;
    this.Y.on(this.mainMessageEvent, function(eventData){
        if((typeof that['socket'] !== "undefined") && that.socket) {
            that.socket.send(eventData.data);
        }
    });
};
	
CommunicationManager.prototype.handleMessage = function(cmdData) {
    var that = this;

    console.log('cmdData:', cmdData);
    //var eventName = data.panelname + this.messageEventSuffix;
    //this.Y.fire(eventName, data.data);
    var command = {
        'createpanel': function(commandData) {
            that.Y.screenManager.initializePanel(commandData.panelType, commandData.initData, function(error, panel){
                if(error) {
                    console.log(error);
                }
                else {
                    panel.showPanel();
                }
            });

        }
    };

    command[cmdData.command](cmdData.data);
};
