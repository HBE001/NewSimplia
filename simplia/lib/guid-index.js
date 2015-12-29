var path = require('path');
var fs = require('fs');

exports.getGUID = function (callback) {
  var date = new Date();
  var timeStart = process.hrtime();
  if (callback) {
    fs.readFile(path.join(__dirname, 'codes.json'), 'utf8', function (error, data) {
      if (error) throw new Error(error);
      var codes = JSON.parse(data);
      validateCodes(codes);
      var timeDiff = process.hrtime(timeStart);
      var microSeconds = timeDiff[0]*1e6 + Math.round(timeDiff[1]/1e3);
      date = setMicroseconds(date, microSeconds);
      callback(date + codes.sector_code + '-' + codes.service_code + 'Z');
    });
  }
  else {
    var data = fs.readFileSync(path.join(__dirname, 'codes.json'), 'utf8');
    var codes = JSON.parse(data);
    validateCodes(codes);
    var timeDiff = process.hrtime(timeStart);
    var microSeconds = timeDiff[0]*1e6 + Math.round(timeDiff[1]/1e3);
    date = setMicroseconds(date, microSeconds);
    return date + codes.sector_code + '-' + codes.service_code + 'Z';
  }
};

function validateCodes (codes) {
  if ((codes.sector_code+'').length !== 3) throw new Error('sector_code must be a 3 digit number. sector_code: ' + codes.sector_code);
  if ((codes.service_code+'').length !== 4) throw new Error('service_code must be a 4 digit number. service_code: ' + codes.service_code);
}

function setMicroseconds (date, microSeconds) {
  microSeconds = microSeconds + date.getMilliseconds()*1e3;
  var carrySeconds = Math.floor(microSeconds/1e6);
  date.setUTCSeconds(date.getUTCSeconds()+carrySeconds);
  microSeconds = microSeconds - carrySeconds*1e6;
  microSeconds = (microSeconds*1e6+'').substring(0, 6);
  var isoDateString = date.toISOString();
  return isoDateString.substring(0, 20) + microSeconds + isoDateString[isoDateString.length-1];
}
