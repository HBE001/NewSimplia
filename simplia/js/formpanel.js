/**
 * Created by Imad on 3/16/2015.
 */
FormPanel.prototype = new BasicPanel();
FormPanel.prototype.constructor = FormPanel;

function FormPanel(Y, title, html) {
    this.Y = Y;
    this.createPanel(title);
    this.html = "";
}

FormPanel.prototype.createPanel = function(title) {

    this.panel = new this.Y.Panel({
        headerContent: "<div class='header-title'><span class='alignleft'><span class='alignleft mainpanel_option checklistmenuleft'>&#9776;&nbsp;&nbsp;</span></span>" + title + "<span class='alignleft'> <span class='alignleft mainpanel_option'> <span class='arrow'> <span class='arrowup' style='display:none;'>&#9650;</span> <span class='arrowdown'>&#9660;</span> </span> </span> </span> <span class='panelsalignright checklistmenuright'>  &#9776;&nbsp;&nbsp;</span> </div>",
        //bodyContent: "<div></div>",
        zIndex   	: 10,
        modal      	: false,
        visible    	: false,
        centered 	: false,
        render		: true,
        //width		: "800px",
        //height		: "400px",
        plugins : [this.Y.Plugin.Drag]
    });

};

FormPanel.prototype.setBody = function(html) {
    if (html!='')
        this.panel.set('bodyContent',html);
    else
        this.panel.set('bodyContent', this.html);
};

FormPanel.prototype.getData = function() {
    (function(main) {
        $.ajax({
            type: "GET",
            dataType: "html",
            url: "http://nodejsdev.simplia.com:3011/paneldata",
            data: "id=1",
            success: (function( data ) {
                main.html = data;
		main.panel.set('bodyContent', data);
		main.panel.show();
		main.panel.centered();
            })
        });
    })(this);
}