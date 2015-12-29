/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * © 2010-2015 Lotus Interworks Inc. (“LIW”) Proprietary and Trade Secret.
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

var fs = require('fs');

module.exports = function (app, config) {

    app.get('/guid/get', function(req, res){
        var date = new Date();
        var timeStart = process.hrtime();

        var codes = config.get('config.guid');
        if ((codes.sector_code+'').length !== 3) {
            res.send(JSON.stringify({error: 'sector_code must be a 3 digit number. sector_code: ' + codes.sector_code}));
        }
        if ((codes.service_code+'').length !== 4) {
            res.send(JSON.stringify({error: 'service_code must be a 4 digit number. service_code: ' + codes.service_code}));
        }
        var timeDiff = process.hrtime(timeStart);
        var microSeconds = timeDiff[0]*1e6 + Math.round(timeDiff[1]/1e3);
        date = setMicroseconds(date, microSeconds);
        var guid = date + codes.sector_code + '-' + codes.service_code + 'Z';
        res.send(JSON.stringify({guid: guid}));
    });
};

function setMicroseconds (date, microSeconds) {
    microSeconds = microSeconds + date.getMilliseconds()*1e3;
    var carrySeconds = Math.floor(microSeconds/1e6);
    date.setUTCSeconds(date.getUTCSeconds()+carrySeconds);
    microSeconds = microSeconds - carrySeconds*1e6;
    microSeconds = (microSeconds*1e6+'').substring(0, 6);
    var isoDateString = date.toISOString();
    return isoDateString.substring(0, 20) + microSeconds + isoDateString[isoDateString.length-1];
}
