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
 *
 * @param {Object} Y - YUI Global Object
 * @param {Object} properties - Panel attributes
 * @constructor
 */
function UploadPanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    //Default title
    this.panelTitle = "Upload Panel";
    this.uploaderClass = "fileUploader";
    this.uploadUrl = "./upload";
    this.uploadParams = {};

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
UploadPanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Main initialization function that also fetches the Mogopak URL data
 * @param {Function} cb - Callback function
 */
UploadPanel.prototype.init = function(cb) {
    var that = this;
    BasicPanel.prototype.init.call(this, function(){
        that.setupUploaderUI();
        that.setupUploader();
        if(typeof cb !== "undefined") {
            cb();
        }
    });
};

UploadPanel.prototype.setupUploaderUI = function() {
    this.panel.set(
        'bodyContent',
        '<div class="' + this.uploaderClass + '" style="height: 330px;"><p>You browser doesn\'t have Flash, Silverlight or HTML5 support.</p></div>'
    );
};

UploadPanel.prototype.setupUploader = function() {
    var that = this;
    var uploaderElement = this.getJQPanelElement('.' + this.uploaderClass);
    uploaderElement.pluploadQueue({
        // General settings
        runtimes : 'html5',
        url : 'about:blank',
        max_file_size : this.Y.oxygenConfig.s3.maxUpload,
        //chunk_size: '512KB',
        //chunk_size : '1mb',
        unique_names : true,
        file_data_name: 'file',
        multipart: false,
        method: "PUT",
        rename: true,
        multiple_queues: true,
        dragdrop:true,
        filters : [
            {title : "All files", extensions : "*"},
        ]

        // Flash settings
        //flash_swf_url : '/mogopakupload/resources/plupload/js/plupload.flash.swf',

        // Silverlight settings
        //silverlight_xap_url : '/mogopakupload/resources/plupload//js/plupload.silverlight.xap'
    });

    this.filesUploadObj = uploaderElement.pluploadQueue();

    this.filesUploadObj.bind('FileUploaded', function (ul, file, response) {
        that.uploadCallback.call(that.uploadCallbackObj, file, response, that.uploadParams);
    });

    this.filesUploadObj.bind('BeforeUpload', function (ul, file) {
        ul.settings.url = file.uploadSettings.url;
        file.originalFilename = file.name;
        file.name = file.uploadSettings.id;
        ul.settings.content_type = file.type;

    });

    this.filesUploadObj.bind('UploadComplete', function (ul, files) {
        that.hidePanel();
    });

    this.filesUploadObj.bind('FilesAdded', function(ul, files){
        files.forEach(function(file){
            that.doAjaxJSONCall(
                that.uploadUrl,
                {
                    name: file.name,
                    size: file.size,
                    type: file.type
                },
                function(data) {
                    file.uploadSettings = data;
                }
            );
        });
    });
};

UploadPanel.prototype.setUploadParams = function(params) {
    this.uploadParams = params;
};