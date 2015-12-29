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
 * White Board is a panel derived from BasicPanel class
 * @param Y
 * @param properties
 * @constructor
 */


function WhiteBoardPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    //Default title
    this.panelTitle = "White Board";
    this.colorSwatchMenu = "";
    this.penSwatchMenu = "";
    this.recordingMenu = "";
    this.lastEposideImagesMenu = "";
    this.selectRoleDialogBox = "";
    this.roleType = "";
    this.tableName = "whiteboardDataTable";
    this.createTableURL = "./whiteboarddataservices/createtable";
    this.dropTableURL = "./whiteboarddataservices/droptable";
    this.addSnapURL = "./whiteboarddataservices/addsnap";
    this.getSnapURL = "./whiteboarddataservices/getsnap";
    this.addSegmentURL = "./whiteboarddataservices/addsegment";
    this.getSegmentURL = "./whiteboarddataservices/getsegment";
    this.signImageURL = "./whiteboarddataservices/signImage";
    this.episodeName = "episode_" + (new Date().getTime());
    this.GUID = "";
    this.panelClassName = "WhiteBoardPanel";

    this.intialized = false;

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
WhiteBoardPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Essential init function that should always be called by the panel loader utility.
 * Also, it's imperative to call the base class (which may not be BasicPanel always) init function in it
 * @param cb
 */
WhiteBoardPanel.prototype.init = function (cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    var that = this;

    BasicPanel.prototype.init.call(this, function () {
        $.getScript("./js/menus/rightsubmenu.js");
        $.getScript("./js/menus/customesubmenu.js");
        $.getScript("./js/notifications/basicnotification.js", function () {
            console.log("Notification Manger Created");
            that.notificationManager = new BasicNotification(that.Y, {
                parentPanel: that,
            });
        });

        $.getScript("./js/panels/whiteBoardScript.js", function () {
            console.log("Whiteboard App Script Loaded");
            whiteboardApp.intializeWhiteboard();

            if(typeof that.intializeWhiteboard !== "undefined" && that.intializeWhiteboard) {
                that.startWhiteboard();
                $("#" + that.panel.get('id')).css("width", 600);
                $("#" + that.panel.get('id')).css("height", 300);

                whiteboardApp.canvas.width = 600;
                whiteboardApp.canvas.height = 300;

                $('.drawCanvas').parent().css("height", $('.drawCanvas').parent().height() - 3);

                that._showSelectRoleDialogBox("Select Role", "Please, Select your role in the current whiteboard?!");
            }

            console.log("Whiteboard App Intialized");
        });
        $.getScript("./js/html2canvas.js");

        $.getScript("./js/iColorPicker.js", function () {
            iColorPicker();
        });

        //that.manageRightMenuStatus();
        if (typeof cb !== "undefined") {
            cb();
        }
    });
};

/*-------------------------------------------------------------*/
WhiteBoardPanel.prototype.startWhiteboard = function () {
    if (!this.intialized) {
        var that = this;
        that._createSelectRoleDialogBox();
        that._showSelectRoleDialogBox("Select Role", "Please, Select your role in the current whiteboard?!");
        whiteboardApp.startRecording();
        that.manageRightMenuStatus();
        that.instantiatePanel();
        this.intialized = true;
    }
}

/*-------------------------------------------------------------*/
WhiteBoardPanel.prototype.alignOverParent = function () {
    var that = this;

    $("#" + this.panel.get('id')).css("width", $('#' + this.parentPanel.panel.get('boundingBox').get('id')).width() + 4);
    $("#" + this.panel.get('id')).css("height", $('#' + this.parentPanel.panel.get('boundingBox').get('id')).height());

    whiteboardApp.canvas.width = ($('#' + this.parentPanel.panel.get('boundingBox').get('id') + " .yui3-widget-bd").width() + 4 );
    whiteboardApp.canvas.height = ($('#' + this.parentPanel.panel.get('boundingBox').get('id') + " .yui3-widget-bd").height() + 38 );
    $('.drawCanvas').parent().css("height", $('.drawCanvas').parent().height() - 3);

    this.alignPanel('#' + this.parentPanel.panel.get('boundingBox').get('id'),
        [that.Y.WidgetPositionAlign.TL, that.Y.WidgetPositionAlign.TL]);

    html2canvas($('#' + this.parentPanel.panel.get('boundingBox').get('id'))[0], {
        onrendered: function (canvas) {
            whiteboardApp.drawCanvasImage(canvas.toDataURL(), 0, 0, whiteboardApp.saveCurrentWork);
        }
    });
}
/*---------------------------------------------------------------------------*/
/**
 *
 */
WhiteBoardPanel.prototype.instantiatePanel = function () {
    //Always call the base class's function
    var that = this;

    that.Y.socksMgr.getSocket('mainwebsocket').send(JSON.stringify({
        message: 'instantiate-whiteboard-panel',
        data: {
            panelname: that.panelClassName
        }
    }));

    that.Y.socksMgr.getSocket('mainwebsocket').onmessage = function (event) {
        console.log("Whiteboard Panel Recieved Message");
        console.log(event.data);
        var recievedMessage = JSON.parse(event.data);
        if (recievedMessage.setPanelGUID !== undefined && recievedMessage.setPanelGUID != "") {
            console.log("Setting Panel GUID");
            that.GUID = recievedMessage.setPanelGUID;
        } else if (that.GUID == recievedMessage.panelGUID) { /* Check If that message belong to that Panel */
            console.log("Whiteboard Recieved Message Via WebSocket = ", recievedMessage.message);
        }
    }
};

/*---------------------------------------------------------------------------*/
/**
 *
 */
WhiteBoardPanel.prototype.setupRoledRightMenu = function () {
    /*-------------------------------------------------------------*/
    /* Remove default Close button*/
    $('#' + this.rightMenu.menu.get('id')).find('.rightmenu-container ul li:last-child').remove();
    /*-------------------------------------------------------------*/

    if (this.roleType == "admin") {
        this._addNewOption();
    }
    if (this.roleType != "viewer") {
        this._addOpenOption();
        this._addSnapOption();
        this._addClearOption();
        this._addUndoOption();
        this._addRedoOption();
        this._addSaveOption();
        this._addLoadOption();
        this._addChatOption();
    }

    this._addRecordingOptions();

    if (this.roleType != "viewer") {
        this._addColorsOption();
        this._addPensOption();
    }

    /*-------------------------------------------------------------*/
    /* Add our new Close Button*/
    var that = this;
    this.addRightMenuItem("Close", function () {
        that.saveEpisode(whiteboardApp.getCurrentWork());
        that.hidePanel();
        that.hideAllMenus();
    }, true);
};

/*-------------------------------------------------------------*/
WhiteBoardPanel.prototype.manageRightMenuStatus = function () {
    var that = this;
    this.Y.one("#" + that.panel.get('id') + " .checklistmenuright").on("click", function () {
        console.log("Manage Right Menu Status");
        if (that.colorSwatchMenu != "" && that.colorSwatchMenu.isActive) {
            that.colorSwatchMenu.activate();
            that.alignWithRightMenu(that.colorSwatchMenu, that.rightMenu);
        }

        if (that.penSwatchMenu != "" && that.penSwatchMenu.isActive) {
            that.penSwatchMenu.activate();
            that.alignWithRightMenu(that.penSwatchMenu, that.rightMenu);
        }

        if (that.recordingMenu != "" && that.recordingMenu.isActive) {
            that.recordingMenu.activate();
            that.alignWithRightMenu(that.recordingMenu, that.rightMenu);
        }
        if (that.lastEposideImagesMenu != "" && that.lastEposideImagesMenu.isActive) {
            that.lastEposideImagesMenu.activate();
            that.alignWithRightMenu(that.lastEposideImagesMenu, that.rightMenu);
        }
    }, this);
}

/*-------------------------------------------------------------*/
/**
 *
 */
WhiteBoardPanel.prototype.alignWithRightMenu = function (menuToAlign, menuToAlighWith) {
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


/*-------------------------------------------------------------*/
WhiteBoardPanel.prototype.hideAllMenus = function () {
    var that = this;
    console.log("Hide all Right Menus");
    if (that.colorSwatchMenu != "" && that.colorSwatchMenu.isActive) {
        that.colorSwatchMenu.deactivate();
    }

    if (that.penSwatchMenu != "" && that.penSwatchMenu.isActive) {
        that.penSwatchMenu.deactivate();
    }

    if (that.recordingMenu != "" && that.recordingMenu.isActive) {
        that.recordingMenu.deactivate();
    }
    if (that.lastEposideImagesMenu != "" && that.lastEposideImagesMenu.isActive) {
        that.lastEposideImagesMenu.deactivate();
    }
}
/*----------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------*/

/**
 *
 * @private
 */
WhiteBoardPanel.prototype._addNewOption = function () {
    var that = this;
    that.addRightMenuItem("New", function () {
        console.log("New Board Action");
        whiteboardApp.resetCanvas();
        whiteboardApp;
        that.episodeName = "episode_" + (new Date().getTime());

        //$.ajax({
        //    url: that.createTableURL,
        //    type: "POST",
        //    dataType: "json",
        //    success: function (data) {
        //        console.log("In Case of Success");
        //        console.log(data);
        //    }
        //})

        that.notificationManager.showMessage("New Document Created", 2000);
        that.rightMenu.menu.show();
    }, true);
};

/*----------------------------------------------------------------------------------*/
/**
 *
 * @private
 */
WhiteBoardPanel.prototype._addOpenOption = function () {
    var that = this;
    that.addRightMenuItem("Open", function () {
        console.log("Open Existing Board Action");
        whiteboardApp.openLocalImage();
        that.rightMenu.menu.show();
    }, true);
};

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
WhiteBoardPanel.prototype._addSnapOption = function () {
    var that = this;
    that.addRightMenuItem("Snap", function () {
        whiteboardApp.saveCurrentWork();
        that.rightMenu.menu.show();
    }, true);
};

/*----------------------------------------------------------------------------------*/
/**
 *
 * @private
 */
WhiteBoardPanel.prototype._addClearOption = function () {
    var that = this;
    that.addRightMenuItem("Clear", function () {
        console.log("Clear Current Board Action");
        whiteboardApp.clearCanvas();

        //$.ajax({
        //    url: that.dropTableURL,
        //    type: "POST",
        //    dataType: "json",
        //    success: function (data) {
        //        console.log("In Case of Success");
        //        console.log(data);
        //    }
        //})

        that.notificationManager.showMessage("Hello World! From Lotus Inter Works ... ", 2000);
        that.rightMenu.menu.show();
    }, true);
};

/*----------------------------------------------------------------------------------*/
/**
 *
 * @private
 */
WhiteBoardPanel.prototype._addUndoOption = function () {
    var that = this;
    that.addRightMenuItem("Undo Segment", function () {
        console.log("Undo Segment");
        whiteboardApp.undoSegment();
        that.rightMenu.menu.show();
    }, true);
};

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
WhiteBoardPanel.prototype._addRedoOption = function () {
    var that = this;
    that.addRightMenuItem("Redo Segment", function () {
        console.log("Stop Recording");
        whiteboardApp.redoSegment();
        that.rightMenu.menu.show();
    }, true);
};


/*----------------------------------------------------------*/
/**
 /**
 *
 * @private
 */
WhiteBoardPanel.prototype._addSaveOption = function () {
    var that = this;

    this.addRightMenuItem("Save Episode", function () {
        that.saveEpisode(whiteboardApp.getCurrentWork());
        /*---------------------------------------------*/
        that.rightMenu.menu.show();
    }, true);
}

/*----------------------------------------------------------*/
WhiteBoardPanel.prototype.saveEpisode = function (episodeHistory) {
    var that = this;
    for (var recordingIndex = 0; recordingIndex < episodeHistory.length; recordingIndex++) {
        var imageName = "image_" + episodeHistory[recordingIndex].startTime;
        var imageType = "image/png";
        var episodeName = that.episodeName;

        that.signRequest(imageName, imageType, episodeName, recordingIndex, function (response, recordingIndex) {
            // check if segment doesn't saved before with assuming that image has URL not base64encoded
            if (episodeHistory[recordingIndex].image.indexOf(',') != -1) {
                upload(dataURItoBlob(episodeHistory[recordingIndex].image), response.signed_request, function () {
                    episodeHistory[recordingIndex].image = response.url;
                    that.saveSegmentToDatabase(episodeHistory[recordingIndex]);
                });
            }

        });
    }

}

/*----------------------------------------------------------*/
function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/png'});
}

/*----------------------------------------------------------*/
WhiteBoardPanel.prototype.signRequest = function (imageName, imageType, episodeName, recordingIndex, callback) {

    var xhr = new XMLHttpRequest();
    xhr.open("POST", this.signImageURL + "?image_name=" + imageName + "&image_type=" + imageType + "&episode_name=" + episodeName);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            callback(response, recordingIndex);
        }
    }
    xhr.send();
}

/*----------------------------------------------------------*/
function upload(image, signed_request, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", signed_request);
    xhr.setRequestHeader('acl', 'public-read');
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("Upload Finish");
            callback();
        }
    }

    xhr.onerror = function () {
        console.log("Could not upload file.");
    };
    xhr.send(image);
}

/*----------------------------------------------------------*/
WhiteBoardPanel.prototype.saveSnaptoDatabase = function (response) {
    var that = this;
    var tableRow = {
        Eposide_Name: that.episodeName,
        Store_Time: new Date().getTime(),
        Image_KEY: response.key,
        IMAGE_URL: response.url
    };

    $.ajax({
        url: that.addSnapURL,
        type: "POST",
        dataType: "json",
        data: "row=" + JSON.stringify(tableRow),
        success: function (data) {
            console.log("Snap Saved to our Database");
            console.log(data);
            that.notificationManager.showMessage("Saved Successfuly ... ", 2000);
        }
    })
}

/*----------------------------------------------------------*/
WhiteBoardPanel.prototype.saveSegmentToDatabase = function (response) {
    console.log("Trying to save following segment");
    console.log(response);
    var that = this;
    var tableRow = {
        Eposide_Name: that.episodeName,
        Segment: response
    };
    console.log("tableRow =======> ");
    console.log(tableRow);
    console.log(JSON.stringify(tableRow));

    $.ajax({
        url: that.addSegmentURL,
        type: "POST",
        dataType: "json",
        data: tableRow,
        success: function (data) {
            console.log("Segment Saved to our Database");
            console.log("===============================================");
            console.log(data);
            console.log("===============================================");
            that.notificationManager.showMessage("Saved Successfuly ... ", 2000);
        }
    })
}

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
WhiteBoardPanel.prototype._addLoadOption = function () {
    var that = this;
    this.addRightMenuItem("Load Episode", function () {
        that.loadEpisode(that.episodeName);
        that.rightMenu.menu.show();
    }, true);
}

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
WhiteBoardPanel.prototype._addChatOption = function () {
    var that = this;
    this.addChildPanel('whiteboardchatpanel', 'Whiteboardchatpanel', {
        panelTitle: "Whiteboard Chat Panel",
        parentPanel: this
    }, function (error, panel) {
        if (error) {
            console.log(error);
            return;
        }

        that.addRightMenuItem("Whiteboard Chat Panel", function () {
            panel.showPanel();
            panel.bringToTop(that);
        }, true);
    });
}

/*----------------------------------------------------------*/
/**
 *
 * @public
 */
WhiteBoardPanel.prototype.loadEpisode = function (episodeName, callback) {
    var that = this;
    $.ajax({
        url: that.getSegmentURL,
        type: "POST",
        dataType: "json",
        data: "Episode_Name=" + episodeName,
        success: function (tableData) {
            console.log("Loaded Successfuly From the Server");
            console.log(tableData);
            that.episodeName = tableData.data.Item.EpisodeKey;
            whiteboardApp.drawingRecording = JSON.parse(tableData.data.Item.recordingSegments);
            that.notificationManager.showMessage("Episode Saved Successfuly ... ", 2000);
            if (callback !== undefined) {
                callback();
            }
        }
    });
}

/*----------------------------------------------------------*/
/**
 *
 * @private
 */
WhiteBoardPanel.prototype._addRecordingOptions = function () {
    var that = this;

    that.addRightMenuItem("Recording <span style=\"color: #0072C5;\">&#9660;</span>", function () {
        console.log("Adding Recording Menu");
        if (that.recordingMenu == "") {
            // ------------------------------------------------------------
            that.recordingMenu = new RightSubMenu(this.Y, {
                subMenuTitle: "Recording",
                parentPanel: that,
                parentMenu: that.rightMenu,
                isParentSubMenu: false
            });
            //that.recordingMenu.menu.set('headerContent', '<div class="header-title">&#9660; Select Color</div>');
            that.recordingMenu.menu.align("#" + that.recordingMenu.parentPanel.panel.get('id') + ' .yui3-widget-bd',
                [that.recordingMenu.Y.WidgetPositionAlign.TR, that.recordingMenu.Y.WidgetPositionAlign.TR]);

            // ------------------------------------------------------------
            var _that = that;

            that.recordingMenu.addMenuItem("Episodes Images <span style=\"color: #0072C5;\">&#9660;</span>", function () {
                console.log("Previous Episodes Images");
                if (_that.lastEposideImagesMenu == "") {
                    _that.lastEposideImagesMenu = new RightSubMenu(this.Y, {
                        subMenuTitle: "Episodes Images",
                        parentPanel: that,
                        parentMenu: that.recordingMenu,
                        isParentSubMenu: true
                    });
                }

                _that.lastEposideImagesMenu.removeAllMenuItems();
                _that.lastEposideImagesMenu.menu.align("#" + _that.lastEposideImagesMenu.parentPanel.panel.get('id') + ' .yui3-widget-bd',
                    [_that.lastEposideImagesMenu.Y.WidgetPositionAlign.TR, _that.lastEposideImagesMenu.Y.WidgetPositionAlign.TR]);
                console.log("episodesAndSnapsImages = ");
                console.log(whiteboardApp.episodesAndSnapsImages);

                for (var imageId in whiteboardApp.episodesAndSnapsImages) {
                    console.log("adding Episode: " + parseInt(parseInt(imageId) + 1));
                    _that.lastEposideImagesMenu.addMenuItem(("Segment: " + parseInt(parseInt(imageId) + 1)), buildPreviousImagecallback(imageId), true);
                }

                that.recordingMenu.deactivate();
                _that.lastEposideImagesMenu.activate();
            });

            that.recordingMenu.addMenuItem("Playback Recording", function () {
                console.log("Playback Recordign");
                whiteboardApp.playbackRecording();
            });

            if (that.roleType == "admin") {
                that.recordingMenu.addMenuItem("Stop Recording", function () {
                    console.log("Stop Recording");
                    whiteboardApp.stopRecording();
                });

                that.recordingMenu.addMenuItem("Start Recording", function () {
                    console.log("Recording Stream");
                    whiteboardApp.startRecording();
                });
            }
            that.recordingMenu.highlightMenuItem("Start Recording");
        }
        that.recordingMenu.activate();
    }, true);
};

/*-------------------------------------------------------------*/
function buildPreviousImagecallback(imageId) {
    return function () {
        whiteboardApp.showPreviousEpisodeImage(imageId);
    };
}
/*----------------------------------------------------------*/
/**
 * @private
 */
WhiteBoardPanel.prototype._addColorsOption = function () {
    var that = this;
    that.addRightMenuItem("Select Color <span style=\"color: #0072C5;\">&#9660;</span>", function () {
        console.log("Adding Color Swatch Menu");
        //iColorShow(color, $('#' + that.rightMenu.menu.get('boundingBox').get('id')).position(), that._changePenColor);
        //that.rightMenu.menu.show();
        if (that.colorSwatchMenu == "") {
            var _that = that;
            whiteboardApp.color = "black";
            // ------------------------------------------------------------
            that.colorSwatchMenu = new CustomeSubMenu(this.Y, {
                subMenuTitle: "Select Color",
                parentPanel: that,
                parentMenu: that.rightMenu,
                isParentSubMenu: false,
                HTMLBody: $('#iColorPicker').html(),
                callbackFunction: (function () {
                    iColorShow(that.color, that._changePenColor)
                }),
                color: whiteboardApp.color
            });
            //that.colorSwatchMenu.menu.set('headerContent', '<div class="header-title">&#9660; Select Color</div>');
            that.colorSwatchMenu.menu.align("#" + that.colorSwatchMenu.parentPanel.panel.get('id') + ' .yui3-widget-bd',
                [that.colorSwatchMenu.Y.WidgetPositionAlign.TR, that.colorSwatchMenu.Y.WidgetPositionAlign.TR]);
            // ------------------------------------------------------------
            //that.colorSwatchMenu.addMenuItem($('#iColorPicker').html(), function () {
            //    console.log("Do No thing");
            //    that._changePenColor("gold");
            //});
        }
        that.colorSwatchMenu.activate();
    }, true);
};

/*-------------------------------------------------------------*/
WhiteBoardPanel.prototype._changePenColor = function (newColor) {
    var that = this;
    //that.parentPanel._changePenColor();
    console.log('color before: ' + whiteboardApp.color);
    whiteboardApp.color = newColor;
    console.log('color after: ' + whiteboardApp.color);
};
/*----------------------------------------------------------*/

/*----------------------------------------------------------*/
/**
 * @private
 */
WhiteBoardPanel.prototype._addPensOption = function () {
    var that = this;
    that.addRightMenuItem("Select Pen <span style=\"color: #0072C5;\">&#9660;</span>", function () {
        console.log("Adding Pen Swatch Menu");

        if (that.penSwatchMenu == "") {
            var _that = that;
            // ------------------------------------------------------------
            that.penSwatchMenu = new RightSubMenu(this.Y, {
                subMenuTitle: "Select Pen",
                parentPanel: that,
                parentMenu: that.rightMenu,
                isParentSubMenu: false
            });
            //that.penSwatchMenu.menu.set('headerContent', '<div class="header-title">&#9660; Select Color</div>');
            that.penSwatchMenu.menu.align("#" + that.penSwatchMenu.parentPanel.panel.get('id') + ' .yui3-widget-bd',
                [that.penSwatchMenu.Y.WidgetPositionAlign.TR, that.penSwatchMenu.Y.WidgetPositionAlign.TR]);
            // ------------------------------------------------------------
            that.penSwatchMenu.addMenuItem("<span style=\"font-size: 10px;\">&#x25cf;</span>", function () {
                that._changePenWidth("1");
            }, true, true);

            that.penSwatchMenu.addMenuItem("<span style=\"font-size: 20px;\">&#x25cf;</span>", function () {
                that._changePenWidth("3");
            }, true, true);

            that.penSwatchMenu.addMenuItem("<span style=\"font-size: 30px;\">&#x25cf;</span>", function () {
                that._changePenWidth("5");
            }, true, true);

            that.penSwatchMenu.addMenuItem("<span style=\"font-size: 40px;\">&#x25cf;</span>", function () {
                that._changePenWidth("7");
            }, true, true);

            that.penSwatchMenu.addMenuItem("<span style=\"font-size: 50px;\">&#x25cf;</span>", function () {
                that._changePenWidth("9");
            }, true, true);

            that.penSwatchMenu.addMenuItem("<span style=\"font-size: 60px;\">&#x25cf;</span>", function () {
                that._changePenWidth("11");
            }, true, true);

            that.penSwatchMenu.highlightMenuItemIndex(1);
        }
        that.penSwatchMenu.activate();
    }, true);
};

/*-------------------------------------------------------------*/
WhiteBoardPanel.prototype._changePenWidth = function (newWidth) {
    var that = this;
    console.log('Width before: ' + whiteboardApp.penWidth);
    whiteboardApp.penWidth = newWidth;
    console.log('Width after: ' + whiteboardApp.penWidth);
};

/*----------------------------------------------------------*/
WhiteBoardPanel.prototype._createSelectRoleDialogBox = function () {
    var that = this;

    this.selectRoleDialogBox = new this.Y.Panel({
        headerContent: '<div class="header-title"></div>',
        bodyContent: '<div class="simple-dialog-message icon-none"></div>',
        zIndex: this.panel.get('zIndex'),
        modal: false,
        visible: false,
        centered: false,
        render: false,
        buttons: {
            footer: [
                {
                    name: "admin",
                    label: "Admin",
                    action: "onAdmin"
                },
                {
                    name: "editor",
                    label: "Editor",
                    action: "onEditor"
                },
                {
                    name: "viewer",
                    label: "Viewer",
                    action: "onViewer"
                }
            ]
        },
        plugins: [this.Y.Plugin.Drag]
    });

    this.selectRoleDialogBox.onAdmin = function (e) {
        e.preventDefault();
        this.hide();
        // Admin Code that executes the user confirmed action goes here
        console.log("Admin Selected");
        that.roleType = "admin";
        whiteboardApp.setupWhiteboardListners();
        that.setupRoledRightMenu();
    };

    this.selectRoleDialogBox.onEditor = function (e) {
        e.preventDefault();
        this.hide();
        // Editor code that executes the user confirmed action goes here
        console.log("Editor Selected");
        that.roleType = "editor";
        whiteboardApp.setupWhiteboardListners();
        that.setupRoledRightMenu();
    };

    this.selectRoleDialogBox.onViewer = function (e) {
        e.preventDefault();
        this.hide();
        // Viewer code that executes the user confirmed action goes here
        console.log("Viewer Selected");
        that.roleType = "viewer";
        that.setupRoledRightMenu();
        whiteboardApp.removeDrawingListners();
    };

    this.selectRoleDialogBox.render(this.Y.screenManager.getPanelsParentDiv());
};

/*----------------------------------------------------------*/
/**
 * Displays a select role dialog with customizable title, text
 * @param {string} title - Dialog Title
 * @param {string} text - Text for the body of the dialog
 */
WhiteBoardPanel.prototype._showSelectRoleDialogBox = function (title, text) {
    $('#' + this.selectRoleDialogBox.get('id') + ' .header-title').html(title);
    $('#' + this.selectRoleDialogBox.get('id') + ' .simple-dialog-message').html(text);
    $('#' + this.selectRoleDialogBox.get('boundingBox').get('id') + ' .yui3-widget-ft').css('text-align', 'center');

    this.selectRoleDialogBox.align('#' + this.panel.get('boundingBox').get('id') + ' .yui3-widget-bd', [this.Y.WidgetPositionAlign.TC, this.Y.WidgetPositionAlign.TC]);

    this.selectRoleDialogBox.set("zIndex", this.panel.get("zIndex") + 1);

    this.selectRoleDialogBox.show();
};