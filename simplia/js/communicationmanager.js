function CommunicationManager(Y) {
	//Initialization code
	this.Y = Y;
	this.socket = "";
	this.messageEventSuffix = "-messageevent";
	this.mainMessageEvent = "messageevent"
	
	this.init = function(config){
		for(var i in config){
			if(typeof this[i] !== "undefined") {
				this[i] = config[i];
			}
		}
	};
	
	(function(main) {
		main.Y.on(main.mainMessageEvent, function(eventData){
			if((typeof main['socket'] !== "undefined") && main.socket) {
				main.socket.send(eventData.data);
			}
		});
	})(this);
	
	this.handleMessage = function(data) {
		var eventName = data.panelname + this.messageEventSuffix;
		this.Y.fire(eventName, data.data);
	};
}