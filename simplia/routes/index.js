/**
 * Created by Imad on 4/16/2015.
 */
var fs = require('fs');

module.exports = function(params){
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file == "index.js") return;
        var pattern = /\.js$/;
        if(pattern.test(file)) {
            var name = file.substr(0, file.indexOf('.'));
            require('./' + name)(params.globals.apps.express, params.config);
        }
    });
};