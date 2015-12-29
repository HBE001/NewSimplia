/**
 * Created by Imad on 2/12/2015.
 */

function FileManager(config) {
    this.socketAddress = "ws://nodejs.simplia.com/mogopak/socket";
    this.socket = "";
    this.initSocket(config);
    this.callbacks = {};
    this.fileTreeHandler = new FileTreeHandler(this);
    this.keepAliveMsgInterval = 30000;
    this.fileInclusionsPrefix = '<html><head><script src="//code.jquery.com/jquery-1.7.2.min.js"></script><script src="//code.jquery.com/ui/1.8.21/jquery-ui.min.js"></script><script src="//service2015.s3.amazonaws.com/mogopak-code/jquery.ui.touch-punch.min.js"></script> <link rel="stylesheet" href="//code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css"> <script src="//code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script><script src="//service2015.s3.amazonaws.com/mogopak-code/custom-code.js"></script></head><body>';
    this.fileInclusionsSuffix = '</body></html>';
}

FileManager.prototype.initSocket = function(config) {
    this.socket = new WebSocket(this.socketAddress);
    this.socket.parent = this;
    this.socket.onopen = function(ev) {
        (function(socket) {
            setInterval(function () {
                var message = {type: 'keepalive'};
                socket.send(JSON.stringify(message));
            }, socket.parent.keepAliveMsgInterval);
        })(this);

        if(config && typeof config.socketOnopen !== "undefined") {
            config.socketOnopen(ev);
        }
    };

    var that = this;
    this.socket.onmessage = function(ev) {
        var dataObj = JSON.parse(ev.data);
        switch(dataObj.command) {
            case 'uploadfile':
                that.uploadFile(dataObj.data);
                break;

            case 'displayfiles':
                that.displayFiles(dataObj.data);
                break;

            case 'displayfile':
                that.displayFile(dataObj.data);
                break;
        }
        if(config && typeof config.socketOnmessage !== "undefined") {
            config.socketOnmessage(data);
        }
    };
};

FileManager.prototype.saveFile = function(data) {
    this.socket.send(JSON.stringify({command: 'savefile', data: data}));
};

FileManager.prototype.uploadFile = function(data) {
    console.log(data.url);
    $.ajax({
        url: data.url,
        type: 'PUT',
        contentType: data.contentType,
        data: this.fileInclusionsPrefix + tinyMCE.activeEditor.getContent({format : 'raw'}) + this.fileInclusionsSuffix,
        success: function() {
            console.log('uploaded data successfully')
        }
    });
};

FileManager.prototype.uploadFileOld = function(data) {
    data = JSON.parse(data);
    var xmlhttp = new XMLHttpRequest();
    var fd = new FormData();
    fd.append('key', data.filepath);
    //fd.append('acl', 'public-read');
    fd.append('Content-Type', 'text/html');
    fd.append('AWSAccessKeyId', data.accessKey);
    fd.append('policy',  data.policy);
    fd.append('signature', data.signature);
    fd.append('success_action_status', '200');
    fd.append("file", tinyMCE.activeEditor.getContent({format : 'raw'}));
    xmlhttp.open('POST', data.uploadurl, true);
    xmlhttp.send(fd);
};

FileManager.prototype.getFiles = function(selector, cb) {
    var cbFlag = 0;
    if(cb) {
        this.callbacks['getfiles'] = cb;
        cbFlag = 1;
    }
    this.socket.send(JSON.stringify({command:'getfiles', data: { selector: selector, cbInfo: {flag: cbFlag, key: 'getfiles'}}}));
};

FileManager.prototype.getFile = function(filename, cb) {
    var cbFlag = 0;
    if(cb){
        this.callbacks['getfile'] = cb;
        cbFlag = 1;
    }
    this.socket.send(JSON.stringify({command:'getfile', data: { filename: filename, cbInfo: {flag: cbFlag, key: 'getfile'}}}));
};

FileManager.prototype.displayFiles = function(data){
    if(data.cbInfo.flag) {
        this.callbacks[data.cbInfo.key](data.files);
    }
};

FileManager.prototype.displayFile = function(data) {
    tinyMCE.activeEditor.setContent(data.file, {format: 'raw'});
    if(data.cbInfo.flag) {
        this.callbacks[data.cbInfo.key](data);
    }
}