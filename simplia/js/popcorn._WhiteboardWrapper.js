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

(function (Popcorn, document) {

    var EMPTY_STRING = "";

    function WhiteboardPlayer() {
        this.startTime = 0;
    }

    function whiteboardPlay(episode) {
        episode.startTime = Date.now();
    }

    WhiteboardPlayer.prototype = {
        play: function () {
            this.startTime = Date.now();
            whiteboardPlay(this);
        },
    };

    function WhiteboardEpisodeElement(whiteboardApp, episode) {

        var self = new Popcorn._MediaElementProto(),
            playerReady = false,
            networkState = self.NETWORK_EMPTY,
            readyState = self.HAVE_NOTHING,
            whiteboard = whiteboardApp,
            loadedEpisode = episode,
            player,
            error = null,
            playerReadyCallbacks = [];

        // Namespace all events we'll produce
        self._eventNamespace = Popcorn.guid("WhiteboardEpisodeElement::");

        // Mark type as whiteboard/episode
        self._util.type = "whiteboard/episode";

        function addPlayerReadyCallback(callback) {
            playerReadyCallbacks.push(callback);
        }

        function onPlayerReady() {
            var callback;
            playerReady = true;

            networkState = self.NETWORK_IDLE;
            readyState = self.HAVE_METADATA;
            self.dispatchEvent("loadedmetadata");

            self.dispatchEvent("loadeddata");

            readyState = self.HAVE_FUTURE_DATA;
            self.dispatchEvent("canplay");

            readyState = self.HAVE_ENOUGH_DATA;
            self.dispatchEvent("canplaythrough");

            while (playerReadyCallbacks.length) {
                callback = playerReadyCallbacks.shift();
                callback();
            }

        }

        function destroyPlayer() {
            if (!( playerReady && player )) {
                return;
            }
            player = null;
        }

        function changeSrc(aSrc) {
            if (!self._canPlaySrc(aSrc)) {
                error = {
                    name: "MediaError",
                    message: "Media Source Not Supported",
                    code: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
                };
                self.dispatchEvent("error");
                return;
            }

            loadedEpisode = aSrc;

            if (playerReady) {
                destroyPlayer();
            }

            player = new WhiteboardPlayer();
            onPlayerReady();
        }

        self.play = function () {
            if (!playerReady) {
                addPlayerReadyCallback(function () {
                    self.play();
                });
                addPlayerReadyCallback(whiteboardApp.playbackRecording(loadedEpisode));
                return;
            }
            player.play();
        };

        Object.defineProperties(self, {

            src: {
                get: function () {
                    return loadedEpisode;
                },
                set: function (aSrc) {
                    if (aSrc && aSrc !== loadedEpisode) {
                        changeSrc(aSrc);
                    }
                }
            },

            readyState: {
                get: function () {
                    return readyState;
                }
            },

            error: {
                get: function () {
                    return error;
                }
            }
        });

        self._canPlaySrc = Popcorn.WhiteboardEpisodeElement._canPlaySrc;
        self.canPlayType = Popcorn.WhiteboardEpisodeElement.canPlayType;

        return self;
    }

    Popcorn.WhiteboardEpisodeElement = function (whiteboardApp, loadedEpisode) {
        return new WhiteboardEpisodeElement(whiteboardApp, loadedEpisode);
    };

    // Helper for identifying URLs we know how to play.
    Popcorn.WhiteboardEpisodeElement._canPlaySrc = function (episode) {
        return episode.constructor === Array ?
            "probably" :
            EMPTY_STRING;
    };

    // We'll attempt to support a mime type of video/x-nullvideo
    Popcorn.WhiteboardEpisodeElement.canPlayType = function (type) {
        return type === "whiteboard/episode" || type === "whiteboard/segment" ? "probably" : EMPTY_STRING;
    };

}(Popcorn, document));