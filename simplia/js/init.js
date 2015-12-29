var Y = YUI().use( 
		"yui",
		"event",
		"event-custom",
		"datatable",
        "datatable-base",
		"datatable-sort", 
		"datatable-scroll", 
		"datatable-mutable",
        "datatable-column-widths",
		'datasource-jsonschema',
		'datatable-datasource',
        'gallery-datatable-checkbox-select',
        'gallery-datatable-celleditor-popup',
		'datasource',
		'button',
		'json',
		"io",	
		'datasource-io',	
		"cssbutton",
        "overlay",
		"panel", 
		"dd-plugin",   
		"node", 
		"array-extras", 
		"querystring-stringify", 
		"gallery-notify",
		"event-hover",
		"handlebars",
		"gallery-uuid",
        "resize-base",
        "resize-constrain",
        "resize-plugin",
		function (Y) {
            //Perform an update to fix problems, including a problem with the CheckboxSelect module
            doUpdates(Y);


            Y.notify = new Y.Notify();
            Y.notify.render();

            //Y.userInfo = userInfo;
            Y.socksMgr = new LotusWebsockets(Y);

            Y.peManager = new PanelEventManager(Y);
            Y.cManager = new CommunicationManager(Y);


            async.waterfall([
                function (callback) {
                    var config = {
                        name: 'mainwebsocket',
                        url: Y.socksMgr.createSocketURL('/socket'),
                        onmessage: Y.cManager.handleMessage,
                        onmsgscope: Y.cManager,
                        onopen: callback
                    };
                    Y.socksMgr.setupSocket(config);
                },
                function (callback) {
                    $.ajax({
                        url: "./config",
                        type: "POST",
                        dataType: "JSON",
                        success: function (config) {
                            Y.oxygenConfig = config;
                            callback(null);
                        },
                        error: function (xhr, textStatus, error) {
                            callback(error);
                        }
                    });
                },
                function (callback) {
                    Y.screenManager = new ScreenManager(Y);
                    Y.screenManager.init(callback);
                },
                function(callback){
                    Y.screenManager.initializeScreen(callback);
                }
            ], function (error) {
                if (error) {
                    console.log('Error:', error);
                }
            });


            var initFn = function () {
                geoip2.city(function (location) {
                    $.ajax({
                        type: 'POST',
                        dataType: "json",
                        url: "./api/storelocation",
                        data: "userid=" + Cookies.get("userid") + "&location=" + JSON.stringify(location),
                        success: function (data) {
                        }
                    });
                }, function (error) {
                });
            };
        }
);
