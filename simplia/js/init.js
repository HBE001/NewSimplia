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
			Y.screenManager = new ScreenManager(Y);




            var initFn = function() {
				geoip2.city(function(location){
					$.ajax({
						type: 'POST',
						dataType: "json",
						url: "./api/storelocation",
						data: "userid=" + Cookies.get("userid") + "&location=" + JSON.stringify(location),
						success: function(data) {
						}
					});
				}, function(error) {
				});

                async.series([

                    //function(callback) {
                    //    var properties = {intializeWhiteboard: true};
                    //    Y.screenManager.initializePanel("whiteboardpanel", properties, function(error, panel){
                    //        if(error) {
                    //            console.log(error);
                    //        }
                    //        else {
                    //            panel.showPanel();
                    //            callback(null);
                    //        }
                    //    });
                    //}

                    //function(callback) {
                    //    var properties = {};
                    //    Y.screenManager.initializePanel("jsoneditorpanel", properties, function(error, panel){
                    //        if(error) {
                    //            console.log(error);
                    //        }
                    //        else {
                    //            panel.showPanel();
                    //            callback(null);
                    //        }
                    //    });
                    //},

                    //function(callback) {
                    //    var properties = {};
                    //    Y.screenManager.initializePanel("bfstpanel", properties, function(error, panel){
                    //        if(error) {
                    //            console.log(error);
                    //        }
                    //        else {
                    //            panel.showPanel();
                    //            callback(null);
                    //        }
                    //    });
                    //}

                    //function(callback) {
                    //    var properties = {panelTitle: 'Media Player Panel'};
                    //    Y.screenManager.initializePanel("mediaplayerpanel", properties, function(error, panel){
                    //        if(error) {
                    //            console.log(error);
                    //        }
                    //        else {
                    //            panel.showPanel();
                    //            callback(null);
                    //        }
                    //    });
                    //},

                    //function(callback) {
                    //    var properties = {panelTitle: 'Audio Player Panel'};
                    //    Y.screenManager.initializePanel("audioplayerpanel", properties, function(error, panel){
                    //        if(error) {
                    //            console.log(error);
                    //        }
                    //        else {
                    //            panel.showPanel();
                    //            callback(null);
                    //        }
                    //    });
                    //},


                    //function(callback) {
                    //    var properties = {panelTitle: 'Login'};
                    //    Y.screenManager.initializePanel("LoginPanel", properties, function(error, panel){
                    //        if(error) {
                    //            console.log(error);
                    //        }
                    //        else {
                    //            panel.showPanel();
                    //            callback(null);
                    //        }
                    //    });
                    //},

                    function(callback) {
                        var properties = {panelTitle: 'DynamoDB Four Column Form', tableName: "", updateTime: "2015:09:20:13:45"};
                        Y.screenManager.initializePanel("DynamoFourColumnFormPanel", properties, function(error, panel){
                            if(error) {
                                console.log(error);
                            }
                            else {
                                panel.showPanel();
                                callback(null);
                            }
                        });
                    },


                    //function(callback) {
                    //    var properties = {panelTitle: 'Oxygen Component'};
                    //    Y.screenManager.initializePanel("oxygencomponentsviewpanel", properties, function(error, panel){
                    //        if(error) {
                    //            console.log(error);
                    //        }
                    //        else {
                    //            panel.showPanel();
                    //            callback(null);
                    //        }
                    //    });
                    //},


                    //function(callback) {
                    //    var properties = {panelTitle: 'DynamoDB Input', tableName: "OxygenComponents", updateTime: "2015:09:20:13:45"};
                    //    Y.screenManager.initializePanel("DynDBInputFormPanel", properties, function(error, panel){
                    //        if(error) {
                    //            console.log(error);
                    //        }
                    //        else {
                    //            panel.showPanel();
                    //            callback(null);
                    //        }
                    //    });
                    //},

                    //function(callback) {
                    //    var properties = {tableName: 'test_table', panelTitle: 'DynamoDB Test Table'};
                    //    Y.screenManager.initializePanel("DynamodbDatabaseDatatablePanel", properties, function(error, panel){
                    //        if(error) {
                    //            console.log(error);
                    //        }
                    //        else {
                    //            panel.showPanel();
                    //            callback(null);
                    //        }
                    //    });
                    //},
                    //
                    //
                    //function(callback) {
                    //    var properties = {tableName: 'test_table', panelTitle: 'RDS Test Table'};
                    //    Y.screenManager.initializePanel("databasedatatablepanel", properties, function(error, panel){
                    //        if(error) {
                    //            console.log(error);
                    //        }
                    //        else {
                    //            panel.showPanel();
                    //            callback(null);
                    //        }
                    //    });
                    //}
                    //
                    /*
                    ,
                    function(callback) {
                        var properties = {tableName: 'global_column_translations', panelTitle: 'Table Management'}
                        Y.screenManager.initializePanel("databasedatatablepanel", properties, function(error, panel){
                            if(error) {
                                console.log(error);
                            }
                            else {
                                panel.showPanel();
                                callback(null);
                            }
                        });

                    },

                    function(callback) {
                        var properties = {panelTitle: 'Mogopak Test', mogopakUrl: 'https://s3.amazonaws.com/service2015/mogopak/thefinalproject/1.html'};
                        Y.panelLoader.initializePanel("mogopakviewerpanel", properties, function(error, panel){
                            if(error) {
                                console.log(error);
                            }
                            else {
                                panel.alignPanel('body', [Y.WidgetPositionAlign.TC, Y.WidgetPositionAlign.TC]);
                                panel.showPanel();
                                callback(null);
                            }
                        });
                    }
                    */
                ]);

            };

            var config = {
                name: 'mainwebsocket',
                url: Y.socksMgr.createSocketURL('/socket'),
                onmessage: Y.cManager.handleMessage,
                onmsgscope: Y.cManager,
                onopen: initFn
            };
            Y.socksMgr.setupSocket(config);

});
