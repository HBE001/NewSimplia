function LotusWebsockets(Y) {
	this.Y = Y;
	this.sockets = [];
	this.keepAliveMsgInterval = 30000;
    this.callbacks = {};
	
	this.getSocket = function(socketName) {
		return this.sockets[socketName];
	};

	this.setupSocket = function(configObj) {
		(function (main) {
			var socketName = configObj.hasOwnProperty('name') ? configObj.name : '';
			var socketURL = configObj.hasOwnProperty('url') ? configObj.url : '';
			var openFn = configObj.hasOwnProperty('onopen') ? configObj.onopen : '';
			var openScope = configObj.hasOwnProperty('onopenscope') ? configObj.onopenscope : '';
			var closeFn = configObj.hasOwnProperty('onclose') ? configObj.onclose : '';
			var msgFn = configObj.hasOwnProperty('onmessage') ? configObj.onmessage : '';
			var msgScope = configObj.hasOwnProperty('onmsgscope') ? configObj.onmsgscope : '';

			main.sockets[socketName] = new WebSocket(socketURL);
			
			main.sockets[socketName].onopen = function(ev) {
	            
				setInterval(function(){
					var message = {type: 'keepalive'};
					main.sockets[socketName].send(JSON.stringify(message));
				}, main.keepAliveMsgInterval);
				
				//Call the callback
				if(openFn && typeof(openFn) == "function") {
					var data = ev.data ? JSON.parse(ev.data) : "";
					if(openScope) {
						openFn.apply(openScope, [data]);
					}
					else {
						openFn(data);
					}
				}
			};
			
			main.sockets[socketName].onclose = function(ev) {
				//Call the callback
				if(closeFn && typeof(closeFn) == "function") {
					var data = ev.data ? JSON.parse(ev.data) : "";  
					closeFn(data);
				}				
			};
				
			main.sockets[socketName].onmessage = function(ev) {
				//main.handleIncomingMessage(main.Y.JSON.parse(ev.data));
				//Need to forward the message to the relevant chatroom panel
				if(msgFn && typeof(msgFn) == "function") {
					var data = ev.data ? JSON.parse(ev.data) : "";
					if(msgScope) {
						msgFn.apply(msgScope, [data]);
					}
					else {
						msgFn(data);
					}
                    if((typeof data.callback !== "undefined") && (typeof  main.callbacks[socketName][data.callback] !== "undefined")) {
                        var cbObj = main.callbacks[socketName][data.callback];
                        cbObj.fn.apply(cbObj.scope, [data]);
                    }
				}								
			};
		})(this);
	};

    this.addCallback = function(socketName, cbIndex, scopeObj, func) {
        if(typeof this.callbacks[socketName] === "undefined") {
            this.callbacks[socketName] = {};
        }
        this.callbacks[socketName][cbIndex] = {scope: scopeObj, fn: func};
    };

	this.createSocketURL = function(path) {
        var loc = window.location, new_uri;
        if (loc.protocol === "https:") {
            new_uri = "wss:";
        } else {
            new_uri = "ws:";
        }
        new_uri += "//" + loc.host;
        var regExp = /^(.+)\/.*/;
        var result;
        if(result = regExp.exec(loc.pathname)) {
            new_uri += result[1];
        }
        return new_uri + path;
    };
} 
