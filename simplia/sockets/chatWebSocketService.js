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
 * Created by yahya on 9/17/15.
 */

var redis = require("redis");
var guid = require('/opt/IDServices/node_modules/guid/index.js');

module.exports = function () {
    var that = this;

    this.global_counter = 0;
    this.all_active_chat_connections = {};

    this.subscriber = redis.createClient(6379, '52.2.212.196', {});
    this.publisher = redis.createClient(6379, '52.2.212.196', {});

    this.subscriber.subscribe('whiteboardChatChannel');

    this.subscriber.on("message", function (channel, message) {
        console.log("Message '" + message + "' on channel '" + channel + "' arrived!")
        for (id in that.all_active_chat_connections) {
            that.all_active_chat_connections[id]['ws'].send(JSON.stringify({
                panelGUID: that.all_active_chat_connections[id]['panelGUID'],
                message: message
            }));
        }
    });

    //------------------------------------------------------------------------
    this.handleChatMessage = function (data) {
        this.publisher.publish("whiteboardChatChannel", data.messageBody);
    };

    this.instantiateSessionGUID = function (wss, ws, config) {
        var panelGUID;
        guid.getGUID(config, function (error, guid) {
            console.log("GUID Created", error, guid);
            if (error) {
                ws.send(JSON.stringify({error: error}));
            }
            else {
                panelGUID = guid;
                ws.send(JSON.stringify({setPanelGUID: guid}));
            }
        });

        var id = this.global_counter++;
        wss.id = panelGUID;
        this.all_active_chat_connections[id] = {};
        this.all_active_chat_connections[id]['wss'] = wss;
        this.all_active_chat_connections[id]['ws'] = ws;
        this.all_active_chat_connections[id]['panelGUID'] = panelGUID;
    };
}