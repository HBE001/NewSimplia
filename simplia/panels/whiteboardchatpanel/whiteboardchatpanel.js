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
 * A Whiteboard Chat Panel derived from BasicPanel class
 * @param Y
 * @param properties
 * @constructor
 */
function WhiteBoardChatPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    //Default title
    this.panelTitle = "Whiteboard Chat Panel";
    this.GUID = "";
    this.panelClassName = "WhiteBoardChatPanel";
    this.getGUIDURL = "./whiteboarddataservices/getguid";
    this.sendChatURL = "./whiteboarddataservices/sendchatmessage";


    if (typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
WhiteBoardChatPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Essential initialization function that should always be called by the panel loader utility. Also, it's imperative to call the base class (which may not be BasicPanel always) init function in it
 * @param cb
 */
WhiteBoardChatPanel.prototype.init = function (cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    var that = this;

    BasicPanel.prototype.init.call(this, function () {
        that.instantiatePanel();

        if (typeof cb !== "undefined") {
            cb();
        }
    });
};

/**
 * Overloaded function to add items to the right menu - it's called part of the initialization cycle. Items to the right menu can be added later as well.
 */
WhiteBoardChatPanel.prototype.setupRightMenu = function () {
    //Always call the base class's function
    BasicPanel.prototype.setupRightMenu.call(this);
};

WhiteBoardChatPanel.prototype.instantiatePanel = function () {
    //Always call the base class's function
    var that = this;

    that.Y.socksMgr.getSocket('mainwebsocket').send(JSON.stringify({
        message: 'instantiate-whiteboard-chat-panel',
        data: {
            panelname: that.panelClassName
        }
    }));

    that.Y.socksMgr.getSocket('mainwebsocket').onmessage = function (event) {
        console.log("Chat Panel Recieved Message");
        console.log(event.data);
        var recievedMessage = JSON.parse(event.data);
        if (recievedMessage.setPanelGUID !== undefined && recievedMessage.setPanelGUID != "") {
            console.log("Setting Panel GUID");
            that.GUID = recievedMessage.setPanelGUID;
        } else if (that.GUID == recievedMessage.panelGUID) { /* Check If that message belong to that Panel */
            $('#' + that.panel.get('boundingBox').get('id')
                + ' .yui3-widget-bd .whiteboard-chat-chatbox').append($('<li>').text(recievedMessage.message));
        }
    }

    that.setListners();
};

WhiteBoardChatPanel.prototype.setListners = function () {
    var that = this;

    // disable enter key for sending with only mouse click
    $('#' + this.panel.get('boundingBox').get('id')
        + ' .yui3-widget-bd .whiteboard-chat-form').submit(function () {
        return false;
    });

    $('#' + this.panel.get('boundingBox').get('id')
        + ' .yui3-widget-bd .whiteboard-chat-submitmsg').click(function () {
        console.log("Send clicked");
        console.log("Message = ");
        console.log($('#' + that.panel.get('boundingBox').get('id')
            + ' .yui3-widget-bd .whiteboard-chat-usermsg').val());


        that.Y.socksMgr.getSocket('mainwebsocket').send(JSON.stringify({
            message: 'whiteboard-chat-message',
            data: {
                panelname: that.panelClassName, messageBody: $('#' + that.panel.get('boundingBox').get('id')
                    + ' .yui3-widget-bd .whiteboard-chat-usermsg').val()
            }
        }));

        $('#' + that.panel.get('boundingBox').get('id')
            + ' .yui3-widget-bd .whiteboard-chat-usermsg').val('');
        return false;
    });
};


//    Modify the current whiteboard so that there is an agent on the browser and an agent on the server
//    The agent on the server can publish or subscribe to Redis.
//    The agent on the browser has websocket connection and the server side knows how to push messaes to the broeser agent
//    For start we will test out the client and server connection using websocket.
//    So the server of whiteboard should be able send a text message to the browser.
//    Each Session of whiteboard has its own server side namely session
//    When the whiteboard is invoked by the user, the whiteboard service assigns an GUID that is generated and passed to the webclient
//    So this GUID is shared between the Servie and the specific Browser Client
//    The first effort is to create the ability to publish and subscribe to these GUID's through the whiteboard service
//    From each browser the user can type a message in the text box and all those clients subscribing to the GUID of the
//    browser client should be able to get that message and it presents them simply in a text window next to whiteboard


//    I am only describing one direction
//    Every Panel has a Server Side Component.
//    So, let us say there is a Panel A and and ServerSideComponent SSCA
//    We need to Push a message from SSCA to the PanelA
//    Websocket identifies only the Session uniquely but not the PanelA itself
//    So we need a simple Router in the Browser to Route the message arriving via Websocket to the actual PanelA
//    PanelA has the Globally Unique ID so it has a unique identity in the browser.
//    I do not know the status of Lotus WS library you are using but this feature may be already there check first.
//    When a Server wants publish a message. He only publishes to REDIS
//    All the Servers subscribing to that topic gets the message
//    Then if needed Server will push the message to its client
