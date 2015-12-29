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

/**
 * A Media Player panel derived from BasicPanel class
 * @param Y
 * @param properties
 * @constructor
 */
function MediaPlayerPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    //Default title
    this.panelTitle = "Media Player Panel";
    this.episodeName = "episode_1441252597583";

    this.queryMediaMenu = "";

    this.createSQLiteTableURL = "./mediaplayerservices/createSQLitetable";
    this.dropSQLiteTableURL = "./mediaplayerservices/dropSQLitetable";
    this.addSQLiteTableURL = "./mediaplayerservices/addItems";
    this.getSQLiteTableURL = "./mediaplayerservices/getdata";
    this.describeBFSTTableURL = "./mediaplayerservices/describeTable";

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
MediaPlayerPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Essential initialization function that should always be called by the panel loader utility.
 * Also, it's imperative to call the base class (which may not be BasicPanel always) init function in it
 * @param cb
 */
MediaPlayerPanel.prototype.init = function (cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    var that = this;

    BasicPanel.prototype.init.call(this, function () {
        $.getScript("./js/menus/customesubmenu.js");

        $.getScript("./js/popcorn-complete.js", function () {
            console.log("popcorn Loaded");
            that.addRightMenuHandlers();
        });

        $.getScript("./js/popcorn._WhiteboardWrapper.js", function () {
            console.log("popcorn whiteboard Plugin Loaded");
        });

        $.getScript("./js/jquery.timepicker.js", function () {
            that.constructTimePicker();
        });


        if (typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 * Overloaded function to add items to the right menu - it's called part of the initialization cycle.
 * Items to the right menu can be added later as well.
 */
MediaPlayerPanel.prototype.setupRightMenu = function () {
    //Always call the base class's function
    BasicPanel.prototype.setupRightMenu.call(this);
};

MediaPlayerPanel.prototype.addRightMenuHandlers = function () {
    $('#' + this.rightMenu.menu.get('id')).find('.rightmenu-container ul li:last-child').remove();
    /*-------------------------------------------------------------*/
    this._addPopcornOrchestrator();
    //this._addCreateTable();
    //this._addDropTable();
    this._addDescribeTableItems();
    this._addAddTableItems();
    this._addGetTableItems();
    this._addQueryOptions();
    /*-------------------------------------------------------------*/
    /* Add our new Close Button*/
    var that = this;
    this.addRightMenuItem("Close", function () {
        that.hidePanel();
        //that.hideAllMenus();
    }, true);

};

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
MediaPlayerPanel.prototype._addPopcornOrchestrator = function () {
    var that = this;
    this.addRightMenuItem("Popcorn Orchestrator", function () {

        var popcorn = Popcorn.smart("#popcornNullVideoWrapper", "#t=,100");
        popcorn.play();

        // Add popcorn events here and other functionality
        popcorn.footnote({
            start: 1,
            end: 3,
            text: "Works with the wrapper!",
            target: "footnote-div"
        });

        popcorn.code({
            start: 5,
            end: 6,
            onStart: function (options) {
                that.addPopcornAudioWrapper();
            },
        });

        popcorn.code({
            start: 8,
            end: 10,
            onStart: function (options) {
                that.addPopcornWhiteboardWrapper();
            },
        });

        popcorn.code({
            start: 4,
            end: 5,
            onStart: function (options) {
                that.addPopcornVideoWrapper();
            },
        });

        that.rightMenu.menu.show();
    }, true);
}

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
MediaPlayerPanel.prototype._addCreateTable = function () {
    var that = this;
    this.addRightMenuItem("Create SQLite Table", function () {

        $.ajax({
            url: that.createSQLiteTableURL,
            type: "POST",
            dataType: "json",
            success: function (data) {
                console.log("In Case of Success");
                console.log(data);
            },
            error: function (error) {
                console.log('error');
                console.log(error);
            }

        })

        that.rightMenu.menu.show();
    }, true);
}
/*----------------------------------------------------------*/
/**
 *
 * @private
 */
MediaPlayerPanel.prototype._addDropTable = function () {
    var that = this;
    this.addRightMenuItem("Drop SQLite Table", function () {

        $.ajax({
            url: that.dropSQLiteTableURL,
            type: "POST",
            dataType: "json",
            success: function (data) {
                console.log("In Case of Success");
                console.log(data);
            },
            error: function (error) {
                console.log('error');
                console.log(error);
            }
        })

        that.rightMenu.menu.show();
    }, true);
}
/*----------------------------------------------------------*/
/**
 *
 * @private
 */
MediaPlayerPanel.prototype._addDescribeTableItems = function () {
    var that = this;
    this.addRightMenuItem("Describe Table", function () {

        $.ajax({
            url: that.describeBFSTTableURL,
            type: "POST",
            dataType: "json",
            success: function (data) {
                console.log("In Case of Success");
                console.log(data);
            },
            error: function (error) {
                console.log('error');
                console.log(error);
            }
        })

        that.rightMenu.menu.show();
    }, true);
}
/*----------------------------------------------------------*/
/**
 *
 * @private
 */
MediaPlayerPanel.prototype._addAddTableItems = function () {
    var that = this;
    this.addRightMenuItem("Add Table Items", function () {

        $.ajax({
            url: that.addSQLiteTableURL,
            type: "POST",
            dataType: "json",
            success: function (data) {
                console.log("In Case of Success");
                console.log(data);
            },
            error: function (error) {
                console.log('error');
                console.log(error);
            }
        })

        that.rightMenu.menu.show();
    }, true);
}
/*----------------------------------------------------------*/
/**
 *
 * @private
 */
MediaPlayerPanel.prototype._addGetTableItems = function () {
    var that = this;
    this.addRightMenuItem("Get Table Items", function () {

        $.ajax({
            url: that.getSQLiteTableURL,
            type: "POST",
            dataType: "json",
            data: "table=MediaSegments&limits=1",
            success: function (data) {
                console.log("In Case of Success");
                console.log(data);
            },
            error: function (error) {
                console.log('error');
                console.log(error);
            }
        })

        that.rightMenu.menu.show();
    }, true);
}
/*----------------------------------------------------------*/
/**
 *
 * @private
 */
MediaPlayerPanel.prototype._addQueryOptions = function () {
    var that = this;
    this.addRightMenuItem("Query Media", function () {
        console.log("Adding Query Media Menu");
        //iColorShow(color, $('#' + that.rightMenu.menu.get('boundingBox').get('id')).position(), that._changePenColor);
        //that.rightMenu.menu.show();
        if (that.queryMediaMenu == "") {
            var _that = that;
            // ------------------------------------------------------------
            that.queryMediaMenu = new CustomeSubMenu(this.Y, {
                subMenuTitle: "Query Media",
                parentPanel: that,
                parentMenu: that.rightMenu,
                isParentSubMenu: false,
                HTMLBody: $('#timePicker').html(),
                callbackFunction: (function () {
                    that.setQueryListners();
                    that.alignWithRightMenu(that.queryMediaMenu, that.rightMenu);
                })
            });
            that.queryMediaMenu.menu.set('headerContent', '<div class="header-title">Query Media Segments</div>');
            that.queryMediaMenu.menu.align("#" + that.queryMediaMenu.parentPanel.panel.get('id') + ' .yui3-widget-bd',
                [that.queryMediaMenu.Y.WidgetPositionAlign.TL, that.queryMediaMenu.Y.WidgetPositionAlign.TL]);
            // ------------------------------------------------------------
            //that.queryMediaMenu.addMenuItem($('#iColorPicker').html(), function () {
            //    console.log("Do No thing");
            //    that._changePenColor("gold");
            //});
        }
        that.queryMediaMenu.activate();
        that.rightMenu.menu.show();
    }, true);
}

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
MediaPlayerPanel.prototype.addPopcornWhiteboardWrapper = function () {

    var that = this;
    this.addChildPanel('whiteboardpanel', 'whiteboard', {
        panelTitle: "Whiteboard",
        parentPanel: this
    }, function (error, panel) {
        if (error) {
            console.log(error);
            return;
        }

        panel.loadEpisode(that.episodeName, function () {
            panel.showPanel();
            panel.bringToTop(that);
            var wrapper = Popcorn.WhiteboardEpisodeElement(whiteboardApp, whiteboardApp.drawingRecording);
            var pop = Popcorn(wrapper);
            pop.play();
        });
    });
}

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
MediaPlayerPanel.prototype.addPopcornVideoWrapper = function (source) {
    var that = this;
    this.addChildPanel('videoplayerpanel', 'videoplayer', {
        panelTitle: "Video Player",
        parentPanel: this,
        source: source
    }, function (error, panel) {
        if (error) {
            console.log(error);
            return;
        }
        panel.showPanel();
        panel.bringToTop(that);

        console.log("Video Player Created Successfuly");
    });
}

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
MediaPlayerPanel.prototype.addPopcornAudioWrapper = function (source) {
    var that = this;
    this.addChildPanel('audioplayerpanel', 'audioplayer', {
        panelTitle: "Audio Player",
        parentPanel: this,
        source: source
    }, function (error, panel) {
        if (error) {
            console.log(error);
            return;
        }
        console.log("Audio Player Created Successfuly");

        panel.showPanel();
        panel.bringToTop(that);

    });
}

/* ------------------------------------------------------------- */
MediaPlayerPanel.prototype.addWhiteBoardPanel = function (source) {
    var that = this;
    this.addChildPanel('whiteboardpanel', 'whiteboard', {
        panelTitle: "Whiteboard",
        parentPanel: this,
        source: source
    }, function (error, panel) {
        if (error) {
            console.log(error);
            return;
        }

        that.addRightMenuItem("Add Whiteboard", function () {
            panel.showPanel();
            panel.bringToTop(that);
            panel.startWhiteboard();
            panel.alignOverParent();
        });
    });
};

/*-------------------------------------------------------------*/
/**
 *
 */
MediaPlayerPanel.prototype.alignWithRightMenu = function (menuToAlign, menuToAlighWith) {
    var rightMenuWidth = $('#' + menuToAlighWith.menu.get('boundingBox').get('id')).width();
    var rightMenuHeight = $('#' + menuToAlighWith.menu.get('boundingBox').get('id')).height();
    var rightMenuX = $('#' + menuToAlighWith.menu.get('boundingBox').get('id')).position().left;
    var rightMenuY = $('#' + menuToAlighWith.menu.get('boundingBox').get('id')).position().top;

    var menuToAlignWidth = $('#' + menuToAlign.menu.get('boundingBox').get('id')).width();
    var menuToAlignHeight = $('#' + menuToAlign.menu.get('boundingBox').get('id')).height();
    var menuToAlignX = $('#' + menuToAlign.menu.get('boundingBox').get('id')).position().left;
    var menuToAlignY = $('#' + menuToAlign.menu.get('boundingBox').get('id')).position().top;

    var widthOverlap = rightMenuX - (menuToAlignX + menuToAlignWidth);
    var heightOverlap = menuToAlignY - (rightMenuY + rightMenuHeight);

    if (widthOverlap < 0 && heightOverlap < 0) {
        console.log("need To Align" + menuToAlign.menu.get('boundingBox').get('id'));
        if (widthOverlap > heightOverlap) {
            $('#' + menuToAlign.menu.get('boundingBox').get('id')).css({left: menuToAlignX + widthOverlap});
        } else {
            $('#' + menuToAlign.menu.get('boundingBox').get('id')).css({top: menuToAlignY + (heightOverlap * -1)});
        }
    }
    //$('#' + this.selectRoleDialogBox.get('boundingBox').get('id') + ' .yui3-widget-ft').css('display', 'inline-block');
}

MediaPlayerPanel.prototype.constructTimePicker = function () {
    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "./css/jquery.timepicker.css"
    }).appendTo("head");

    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "./css/pickaday.css"
    }).appendTo("head");

    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "./css/bootstrap-datepicker.css"
    }).appendTo("head");

    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "./css/customButton.css"
    }).appendTo("head");


    $.getScript("./js/datepair.js");
    $.getScript("./js/jquery.datepair.js");
    $.getScript("./js/bootstrap-datepicker.js");


    jQuery(document.createElement("div")).attr("id", "timePicker").css('display', 'none').
        html('<p class="queryOptions">' +
        '<p class="datepairExample">' +
        'Starting Time<br/> <input type="text" class="date start" />' +
        '<input type="text" class="time start" /> <br/>Ending Time<br/>' +
        '<input type="text" class="date end" />' +
        '<input type="text" class="time end" />' +
        '</p> Select Media Segements:<br/>' +
        '<form class="querySegmentOptions">' +
        '<input type="checkbox" class="audio">Audio Segments<br>' +
        '<input type="checkbox" class="video">Video Segments<br>' +
        '<input type="checkbox" class="whiteboard" >Whiteboard Segments<br>' +
        '</form><br/>' +
        '<button id= "queryButton" class= "btn btn-primary btn-block" type="button" style="text-align: center">Query!</button>' +
        '</p>').appendTo("body");
};

MediaPlayerPanel.prototype.setQueryListners = function () {
    var that = this;

    $('.datepairExample .time').timepicker({
        'showDuration': true,
        'timeFormat': 'g:ia'
    });

    $('.datepairExample .date').datepicker({
        'format': 'yyyy-m-d',
        'autoclose': true
    });

    // initialize datepair
    $('#datepairExample').datepair();

    $('#queryButton').click(function () {
        console.log("query clicked");
        that.submitQuery();
    });
};

MediaPlayerPanel.prototype.submitQuery = function () {
    var that = this;

    console.log("query clicked");
    var datePair = new Datepair($('.datepairExample')[0]);
    var startingTime = datePair.getStartTime();
    var endingTime = datePair.getEndTime();

    var mediaSegments = [];
    if ($('.querySegmentOptions .audio').is(":checked")) {
        mediaSegments.push('audio');
    }
    if ($('.querySegmentOptions .video').is(":checked")) {
        mediaSegments.push('video');
    }
    if ($('.querySegmentOptions .whiteboard').is(":checked")) {
        mediaSegments.push('whiteboard');
    }

    console.log(startingTime);
    console.log(startingTime);
    console.log("---------------------------------------");
    console.log($('.querySegmentOptions .audio').is(":checked"));
    console.log($('.querySegmentOptions .video').is(":checked"));
    console.log($('.querySegmentOptions .whiteboard').is(":checked"));
    console.log("---------------------------------------");


    $.ajax({
        url: that.getSQLiteTableURL,
        type: "post",
        dataType: "json",
        data: "startingTime=" + startingTime + "&endingTime=" + endingTime + "&mediaSegments=" + mediaSegments.toString(),
        success: function (data) {
            console.log("Data Loaded");
            console.log(data);

            that.playLoadedMediaSegments(data.data);
        },
        error: function (error) {
            console.log('error');
            console.log(error);
        }
    })
}

MediaPlayerPanel.prototype.playLoadedMediaSegments = function (mediaSegments) {
    var that = this;
    console.log("Media Segment to Play:");
    console.log(mediaSegments);

    var minStartingTime = mediaSegments[0].StartingTime;

    for (var i = 1; i < mediaSegments.length; i++) {
        if (mediaSegments[i].StartingTime < minStartingTime) {
            minStartingTime = mediaSegments[i].StartingTime;
        }
    }

    var popcorn = Popcorn.smart("#popcornNullVideoWrapper", "#t=,100");
    popcorn.play();


    for (var i = 0; i < mediaSegments.length; i++) {
        if (mediaSegments[i].MediaType == "audio") {
            popcorn.code({
                start: mediaSegments[i].StartingTime - minStartingTime,
                end: mediaSegments[i].StartingTime - minStartingTime + 1,
                onStart: function (options) {
                    that.addPopcornAudioWrapper(mediaSegments[i].MediaLocation);
                },
            });
        } else if (mediaSegments[i].MediaType == "video") {
            popcorn.code({
                start: mediaSegments[i].StartingTime - minStartingTime,
                end: mediaSegments[i].StartingTime - minStartingTime + 1,
                onStart: function (options) {
                    that.addPopcornVideoWrapper(mediaSegments[i].MediaLocation);
                },
            });
        } else if (mediaSegments[i].MediaType == "whiteboard") {
            popcorn.code({
                start: mediaSegments[i].StartingTime - minStartingTime,
                end: mediaSegments[i].StartingTime - minStartingTime + 1,
                onStart: function (options) {
                    that.addPopcornWhiteboardWrapper(mediaSegments[i].MediaLocation);
                },
            });
        }
    }
}


// Each Episode is a set of Segments. Segments may be of multiple different media types
// Each Segment has a StartingTime and EndingTime
// The Player Panel is an independent Panel
// In the Player Panel when one opens the RM there will be an option to Play.
// When Play option is selected a Player bar  is presented
// The Player Bar is very much like a  video player but has the model of segments and Episode. So we can advance to the next Segment.
// The player dynamically generates a directory of the Episode from Segment descriptors
// This Directory is integrated in Popcorn and presented to further control selection and play of segments
// The default play mode is to play according to historical time all the active segments
// The custom play is handled by the User from the Directory and individual PlayBars attached to them.
// attached to each Segment I meant
// So we need the following new types of Panels:
// Main  Player Panel can be Directory Panel
// We have the Whiteboard Panel already
// Then we need a Video Panel and Audio Panel
// Yahya, I forgot to tell you that on the video player we need an mp4 player which I think is the default in Popcorn. Please check.


//I have created a DynamoDB Table to store all Segments of Media and the Table Name is MediaSegments.
// The current machine you are using has access to it. The Schema for that Table is below:
//
//Keys	Attribute	    DynamodbType	OxygenPType
//PH	Node	        String	        ID
//PR	Edges	        String	        OES
//      CycleCount	    Number	        Number
//      Status	        String	        String
//      UpdateTime	    String	        OST
//      T1	            String	        OST
//      T2	            String	        OST
//SR1	StartingTime	String	        OST
//      EndingTime	    String	        OST
//SH1	MediaType	    String	        String
//      MediaLocation	String	        String

// There are many Attributes that you will not use. The Segment ID itself is called Node.
// Primary Hash and Range Keys are shown as PH and PR. You will not be using it but the secondary Key Hash MediaType and Range StartingTime
// you will be using to load the results of query for timerange and media into SQLite.
// Once the Segments are in SQLite you will use Media Player to show the list of segments that are in SQLite.
//
//
//  In the main Front End branch there is an example for loading results of dynamodb query into SQLite.
// Unfortunately that is not documented but is easy to figure out be reviewing the code.
//
//
//1- The Node JS module guid.js generates Global Unique ID (GUID) for a service. https://github.com/zurichorg2010/VenkateswarluG/blob/master/guid/guid.js
//2- In Node EC2 instances, The guid module is available at /opt/guid/guid.js.
//3- guid.js module has the following methods:
//getGUID (callback)
//callback: A callback function to execute. Generated GUID will be passed as the only parameter to the callback function.
//getGUID function returns 36 byte guid string consisting 27 byte microseconds accurate current datetime in ISO8601 format,
// 3 byte sector_code, 1 byte “-”, 4 byte service_code, 1 byte “Z”.
//example: https://github.com/zurichorg2010/VenkateswarluG/blob/master/guid/example/server.js

