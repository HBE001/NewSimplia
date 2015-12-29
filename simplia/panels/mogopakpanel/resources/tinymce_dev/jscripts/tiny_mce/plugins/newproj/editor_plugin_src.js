/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	tinymce.create('tinymce.plugins.NewProjPlugin', {
		init : function(ed, url) {
			// Register commands
			ed.addCommand('mceNewproj', function() {
				ed.windowManager.open({
					file : url + '/emotions.htm',
					width : 750 + parseInt(ed.getLang('emotions.delta_width', 0)),
					height : 360 + parseInt(ed.getLang('emotions.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : url
				});
			});

			// Register buttons
			ed.addButton('newproj', {title : 'emotions.emotions_desc', cmd : 'mceNewproj'});
		},

		getInfo : function() {
			return {
				longname : 'NewProject',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/emotions',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('newproj', tinymce.plugins.mceNewproj);
})(tinymce);