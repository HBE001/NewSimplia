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
 * A singleton class that's responsible for loading and maintaining panels
 * @param Y
 * @param repoPath
 * @constructor
 */
function PanelLoader(Y, repoPath) {
    this.Y = Y;
    this.repositoryPath = repoPath || "panels/";
    this.configFilename = "config.json";

    this.cache = {};
}

PanelLoader.prototype.initializePanel = function (panelName, properties, callback) {
    //Lowercase the name, as the main directories will always be lowercased
    panelName = panelName.toLowerCase();


    var that = this;
    this.loadPanelFiles(panelName, function (error) {
        if (error) {
            return callback(error);
        }

        properties = properties || {};

        if (typeof that.cache[panelName].html !== "undefined") {
            properties.bodyContent = that.cache[panelName].html;
        }

        var panel = new window[that.cache[panelName].config.name](that.Y, properties);
        callback(null, panel);
    });
};

PanelLoader.prototype.loadPanelFiles = function (panelName, callback) {
    //Lowercase the name, as the main directories will always be lowercased
    panelName = panelName.toLowerCase();

    //Check if the panel code has already been loaded
    var that = this;
    if (typeof this.cache[panelName] === "undefined") {
        //First, get the configuration file
        var configFile = this.repositoryPath + panelName + "/" + this.configFilename;
        $.ajax({
            url: configFile,
            dataType: "json",
            cache: false,
            timeout: 300000,
            success: function (data, status) {
                that.cache[panelName] = {
                    config: data
                };
                that.processConfig(data, panelName, callback);
            },
            error: function (jqXHR, textStatus, error) {
                //Return with the error;
                callback(error);
            }
        });
    }
    else {
        callback(null);
    }
};

PanelLoader.prototype.processConfig = function (config, panelName, callback) {
    //If there are any dependencies, load them first before continuing the processing
    var that = this;
    if (typeof config['dependencies'] !== "undefined" && $.isArray(config.dependencies)) {
        async.eachSeries(config.dependencies, function (requiredPanel, eachCallback) {
            that.loadPanelFiles(requiredPanel, eachCallback);
        }, function (error) {
            if (error) {
                return callback(error);
            }
            return that.getFiles(config, panelName, callback);
        });
    }
    else {
        this.getFiles(config, panelName, callback);
    }
};

PanelLoader.prototype.getFiles = function (config, panelName, callback) {
    if (typeof config.html !== "undefined") {
        return this.loadHTML(config, panelName, callback);
    }
    this.loadScript(config, panelName, callback);
};

PanelLoader.prototype.loadHTML = function (config, panelName, callback) {
    //Get the HTML code from the repository
    var that = this;
    var fileName = this.repositoryPath + config.html;
    $.ajax({
        url: fileName,
        dataType: "html",
        cache: false,
        timeout: 300000,
        success: function (data, status) {
            that.cache[panelName].html = data;
            that.loadScript(config, panelName, callback);
        },
        error: function (jqXHR, textStatus, error) {
            callback(error);
        }
    });
};


PanelLoader.prototype.loadScript = function (config, panelName, callback) {
    var that = this;
    var fileName = this.repositoryPath + config.js;
    $.ajax({
        url: fileName,
        dataType: "script",
        cache: false,
        timeout: 300000,
        success: function (data, success) {
            that.cache[panelName].js = data;
            $('body').append('<script>' + data + '</script>');
            callback(null, config);
        },
        error: function (xhr, status, error) {
            callback(error);
        }
    });
};

PanelLoader.prototype.getCache = function (panelName) {
    return this.cache[panelName] || undefined;
};