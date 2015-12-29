function PanelEventManager(Y) {
	//Initialization code
	this.Y = Y;
	this.eventSuffix = '-event';
	
	(function(main) {
		main.Y.on('panelevent', function(eventData){
			//Make sure that the object contains all the valid properties for the event to be executed
			if(eventData.hasOwnProperty('panel') && eventData.hasOwnProperty('data')) {
				var panelEventName = eventData.panel + main.eventSuffix;
				console.log('paneleventmanager.js - firing event for ' + panelEventName);
				console.log('paneleventmanager.js - eventData: ' + JSON.stringify(eventData.data));
				main.Y.fire(panelEventName, eventData.data);
				console.log('paneleventmanager.js - done firing');
			}
		});
	})(this);
}
