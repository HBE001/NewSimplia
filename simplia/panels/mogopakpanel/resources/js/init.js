$(document).ready(function(){
    $('#treeviewtoshowhere').click(function(){
        tinyMCE.fileManager.getFiles({path: "", type: "interaction"}, function(files){
            tinyMCE.fileManager.fileTreeHandler.createTree("fileTree", "interaction", files);
            $('#linksbox').hide();
            $('#linksboxgrey').hide();
            $('#firstopen').show();
            $('#secondopen').show();
        });
    });

});