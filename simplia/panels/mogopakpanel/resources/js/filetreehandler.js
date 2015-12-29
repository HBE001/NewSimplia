/**
 * Created by Imad on 3/5/2015.
 */
function FileTreeHandler(filemanager) {
    this.parsedFileData = {};
    this.treeSource = []
    this.filemanager = filemanager;
    this.mode = "";
    this.pathPrefix = "https://s3.amazonaws.com/service2015/";
    this.initialized = 0;
}

FileTreeHandler.prototype.createTree = function(treeElemName, mode, fileData) {
    this.mode = mode;
    this.parseFileData(fileData);
    this.treeSource = [];
    this.treeSource = this.createTreeSource(this.parsedFileData);
    //console.log(this.treeSource);
    if(!this.initialized) {
        this.initializeTree(treeElemName);
        this.initialized = 1;
    }
    else {
        //console.log('reloading tree');
        var tree = $('#' + treeElemName).fancytree("getTree");
        tree.reload(this.treeSource).done(function(){});
    }
};
FileTreeHandler.prototype.initializeTree = function(treeElemName) {
    var that = this;
    $('#' + treeElemName).fancytree({
        source: this.treeSource,
        click: function(event, data) {
            if(data.node.isFolder()) {
                var expVal = true;
                if (data.node.isExpanded()) {
                    expVal = false;
                }
                data.node.setExpanded(expVal);
            }
            else {
                switch(that.mode) {

                    case 'allfiles':
                        that.filemanager.getFile(data.node.key, function () {
                            console.log('node:', data.node);
                            closeopen();
                            hidemenu();
                            $('#projectname').val(data.node.data.project);
                            var exp = /^(.+)\..+$/;
                            var matches = exp.exec(data.node.title);
                            if (matches) {
                                console.log('matches', matches);
                                $('#pagenumber').val(matches[1]);
                            }
                        });
                        break;
                    case 'images':
                        closeopen();
                        hidemenu();
                        tinyMCE.get('content').execCommand('mceAdvImage');
                        //tinyMCE.imageDialog.setImagePath(that.pathPrefix + data.node.key);
                        that.intervalId, that.counter = 0;
                        that.intervalId = setInterval(function () {
                            var retVal = tinyMCE.imageDialog.setImagePath(that.pathPrefix + data.node.key);
                            that.counter++;
                            //console.log('counter', that.counter);
                            if(retVal || that.counter == 20){
                                clearInterval(that.intervalId);
                            }
                        }, 200);
                        break;

                    case 'media':
                        closeopen();
                        hidemenu();
                        tinyMCE.get('content').execCommand('mceMedia');
                        //tinyMCE.imageDialog.setImagePath(that.pathPrefix + data.node.key);
                        that.intervalId, that.counter = 0;
                        that.intervalId = setInterval(function () {
                            var retVal = tinyMCE.window.Media.setPath(that.pathPrefix + data.node.key);
                            that.counter++;
                            //console.log('counter', that.counter);
                            if(retVal || that.counter == 20){
                                clearInterval(that.intervalId);
                            }
                        }, 200);
                        break;

                    case 'link':
                        closeopen();
                        hidemenu();
                        tinyMCE.get('content').execCommand('mceAdvLink');
                        //tinyMCE.imageDialog.setImagePath(that.pathPrefix + data.node.key);
                        that.intervalId, that.counter = 0;
                        that.intervalId = setInterval(function () {
                            //var retVal = tinyMCE.tinyMCEPopup.setLinkFormValue(that.pathPrefix + data.node.key);
                            var retVal = false;
                            if($('.clearlooks2').find('iframe').length > 0) {
                                if($('.clearlooks2').find('iframe')[0].contentWindow.setLinkFormValue) {

                                    retVal = $('.clearlooks2').find('iframe')[0].contentWindow.setLinkFormValue(that.pathPrefix + data.node.key);
                                }
                            }
                            that.counter++;
                            //console.log('counter', that.counter);
                            if(retVal || that.counter == 20){
                                clearInterval(that.intervalId);
                            }
                        }, 200);
                        break;

                    case 'backgroundimages':
                        closeopen();
                        hidemenu();
                        tinyMCE.get('content').execCommand('mceStyleProps');
                        //tinyMCE.imageDialog.setImagePath(that.pathPrefix + data.node.key);
                        that.intervalId, that.counter = 0;
                        that.intervalId = setInterval(function () {
                            //var retVal = tinyMCE.tinyMCEPopup.setLinkFormValue(that.pathPrefix + data.node.key);
                            var retVal = false;


                            if($('.clearlooks2').find('iframe').length > 0) {
                                if($('.clearlooks2').find('iframe')[0].contentWindow.setBackgroundPath) {
                                    retVal = $('.clearlooks2').find('iframe')[0].contentWindow.setBackgroundPath(that.pathPrefix + data.node.key);
                                }
                            }
                            that.counter++;
                            //console.log('counter', that.counter);
                            if(retVal || that.counter == 20){
                                clearInterval(that.intervalId);
                            }
                        }, 200);
                        break;

                    case 'interaction':
                        closeopen();
                        hidemenu();
                        showlinks();
                        getmyselection();
                        var fullFilepath = that.pathPrefix + data.node.key;
                        $('#fileToUpload').val(fullFilepath);
                        $('#filenamehere').text(fullFilepath);
                        break;
                }
            }
        }
    });
};

FileTreeHandler.prototype.parseFileData = function(fileData) {
    this.parsedFileData = {};
    for(var i = 0; i < fileData.length; i++){
        //console.log('path:' + fileData[i].fullpath);
        var folderExp = /^([^\/]+)\/(.+)$/;
        var pathNodes = [];
        var matches = folderExp.exec(fileData[i].fullpath);
        if(matches) {
            var lastObj = this.parsedFileData;
            while (matches) {
                //console.log('matches', matches);
                //console.log('lastObj:', lastObj);
                if (typeof lastObj[matches[1]] === "undefined") {
                    //console.log('empty object for ' + matches[1]);
                    lastObj[matches[1]] = {};
                }
                pathNodes.push(matches[1]);
                var newObj = lastObj[matches[1]];
                //console.log('newObj:', newObj );
                var newMatches = folderExp.exec(matches[2]);
                if (!newMatches) {
                    //console.log(lastObj[matches[1]]);
                    if (typeof lastObj[matches[1]].treeChildren === "undefined") {
                        lastObj[matches[1]].treeChildren = new Array();
                    }
                    fileData[i].name = matches[2];
                    fileData[i].paths = pathNodes;
                    lastObj[matches[1]].treeChildren.push(fileData[i]);
                }
                lastObj = newObj;
                //console.log('lastObj-end:', lastObj);
                matches = newMatches
            }
        }
    }
    //console.log(this.parsedFileData);
};

FileTreeHandler.prototype.createTreeSource = function(node) {
    var tree = [];
    for (var i in node) {
        if(i == 'treeChildren') {
            for(var i = 0; i < node.treeChildren.length; i++) {
                var nodeData = {"title": node.treeChildren[i].name, "key": node.treeChildren[i].fullpath, "path": node.treeChildren[i].path, "project": node.treeChildren[i].paths[node.treeChildren[i].paths.length - 1]};
                //var nodeData = {"title": node.treeChildren[i].name, "key": node.treeChildren[i].fullpath};
                tree.push(nodeData);
            }
        }
        else {
            var nodeData = {"title": i, "key": i, "folder": true, children: this.createTreeSource(node[i])};
            tree.push(nodeData);
        }
    }

    return tree;
};

