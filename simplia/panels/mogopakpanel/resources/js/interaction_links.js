<script type="text/javascript" src="../../jquery.js" ></script >
<script type="text/javascript" src="../../tinymce_dev/jscripts/tiny_mce/tiny_mce.js"></script >
<script type="text/javascript" src="../../tinymce_dev/jscripts/tiny_mce/jquery-ui.js" ></script >
<link rel="stylesheet" href="../../tinymce_dev/jscripts/tiny_mce/jquery-ui.css">
<link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css">

<script>

function showall() { $('#hereall').show(); } 
function iframe(arg) { $('#iframecontent').append('<img src="'+arg+'">'); 
$('#iframe').show(); $('#whiteframe').draggable(); $('#whiteframe').resizable({ aspectRatio: true });} 


function iframeclose() { $('#iframe').hide(); $('#iframecontent').empty(); } 
function linkconnection(phrasepos,topic_page,pagen,topic_extlink,extlink,topic_imgurl,image,topic_uploadimg,uploadimg) { var pgfinal="";var elnkfinal="";var imgfinal="";var theupload="";$('#hereall').empty(); var position = $('#'+phrasepos).position(); $('#hereall').show(); var topicforpg = topic_page.split(","); var pg = pagen.split(",");var topicextlink = topic_extlink.split(","); var elnk=extlink.split(",");var topicimgurl = topic_imgurl.split(","); var imgurl=image.split(","); var topiculoadimg = topic_uploadimg.split(","); var uploadimage=uploadimg.split(","); for(x=0;x<topicforpg.length;x++){ if((topicforpg[x]!="0") && (topicforpg[x]!="")){ pgfinal += '<tr onmouseover="showall()"><td onmouseover="showall()" style="padding-left:8px; padding-right:8px;"><a style="color:white;" href="publish.php?projectname=sssdd&pagenumber='+pg[x]+'&user=radu&form=on" onmouseover="showall()">'+topicforpg[x]+'</a></td></tr>';} else  { pgfinal += ""; } if((topicextlink[x]!="0") && (topicextlink[x]!="")){ elnkfinal += '<tr onmouseover="showall()"><td onmouseover="showall()" style="padding-left:8px; padding-right:8px;"><a style="color:white;"  target="_blank" href="'+elnk[x]+'" onmouseover="showall()">'+topicextlink[x]+'</a></td></tr>'; }else  { elnkfinal += ""; } if((topicimgurl[x]!="0") && (topicimgurl[x]!="")){imgfinal += '<tr onmouseover="showall()"><td onmouseover="showall()" style="padding-left:8px; padding-right:8px;"><a style="color:white;" onclick="iframe(\''+imgurl[x]+'\')" href="#" onmouseover="showall()">'+topicimgurl[x]+'</a></td></tr>'; }  else  { imgfinal += ""; } if((topiculoadimg[x]!="0") && (topiculoadimg[x]!="")){ theupload += '<tr onmouseover="showall()"><td onmouseover="showall()" style="padding-left:8px; padding-right:8px;"><a style="color:white;"  onclick="iframe(\''+uploadimage[x]+'\')"  href="#" onmouseover="showall()">'+topiculoadimg[x]+'</a></td></tr>'; }  else  { theupload += ""; } } $('#hereall').append('<div id="123" style="position:absolute;z-index:9999999;padding-top:20px;top:'+position.top+';left:'+position.left+';" onmouseover="showall()" onmouseout="linkconnectionout();"><table onmouseover="showall()" style="background-color:#5970B2;color:white;font-family:Arial; font-size:11px;">'+pgfinal+elnkfinal+imgfinal+theupload+'</table></div>'); } 


function linkconnectionout() { $('#hereall').hide(); } 

</script> 
