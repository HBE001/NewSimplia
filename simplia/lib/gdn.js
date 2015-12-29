//var AWS = require('/usr/local/lib/node_modules/aws-sdk');
var AWS = require('aws-sdk');
var guid = require('./guid-index.js');
AWS.config.update({'region': 'us-east-1'});

var docClient = new AWS.DynamoDB.DocumentClient();

var validate = {
  email: function (email) {
    if (email.length == 0) {
      return false;
    }
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    return re.test(email);
  },
  prefix: function (prefix) {
    if (prefix && prefix.length>=8) {
      return true;
    }
    else {
      return false;
    }
  }
};

exports.createGDN = function (options, callback) {
  if (validate.prefix(options.Prefix)===false) {
    callback(undefined, {message: 'Prefix should have atleast 8 characters.'});
    return false;
  }
  var params = {
    TableName: 'GDN',
    IndexName: 'Prefix-index',
    KeyConditions: {
      Prefix: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [options.Prefix]
      }
    },
    QueryFilter: {
      InitialSuffix: {
        ComparisonOperator: 'NOT_NULL'
      },
      CurrentSuffix: {
        ComparisonOperator: 'NOT_NULL'
      }
    }
  };

  docClient.query(params, function (err, data) {
    if (err) {
      callback(undefined, err);
    }
    else {
      if (Object.keys(data.Items).length) {
        var item = data.Items[0];
        if (item.OxygenID === options.GUID) {
          callback(item.GDN);
        }
        else {
          incrementSuffix({
            Type: options.Type || 'Simple',
            TableName: params.TableName,
            Node: item.Node,
            Edge: item.Edge,
            MetaType: item.MetaType,
            UpdateTime: (new Date()).toISOString(),
            Status: item.Status,
            GDN: item.GDN,
            OxygenID: item.OxygenID,
            Prefix: item.Prefix,
            InitialSuffix: item.InitialSuffix,
            CurrentSuffix: item.CurrentSuffix
          }, callback);
        }
      }
      else {
        var suffix = randomSuffix();
        addPrefix({
          Type: options.Type || 'Simple',
          TableName: params.TableName,
          Node: guid.getGUID(),
          Edge: '0',
          MetaType: 'GDN',
          UpdateTime: (new Date()).toISOString(),
          Status: 'Active',
          GDN: options.Prefix+'-'+suffix,
          OxygenID: options.GUID,
          Prefix: options.Prefix,
          InitialSuffix: suffix,
          CurrentSuffix: suffix
        }, callback);
      }
    }
  });
};

exports.getGDN = function (guid, callback) {
  var params = {
    TableName: 'GDN',
    IndexName: 'OxygenID-GDN-index',
    KeyConditions: {
      OxygenID: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [guid]
      }
    }
  };
  docClient.query(params, function (err, data) {
    if (err) {
      callback(undefined, err);
    }
    else {
      var gdn = [];
      for (var i=0; i<data.Count; i++) {
        gdn.push(data.Items[i].GDN);
      }
      callback(gdn);
    }
  });
};

exports.getGUID = function (gdn, callback) {
  var params = {
    TableName: 'GDN',
    IndexName: 'GDN-OxygenID-index',
    KeyConditions: {
      GDN: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [gdn]
      }
    }
  };
  docClient.query(params, function (err, data) {
    if (err) {
      callback(undefined, err);
    }
    else {
      if (data.Count) {
        callback(data.Items[0].OxygenID);
      }
      else {
        callback('');
      }
    }
  });
};

function addPrefix (options, callback) {
  if (options.Type==='Email' && validate.email(options.Prefix+'-'+options.CurrentSuffix+'@example.com')===false) {
    callback(undefined, {message: 'Invalid email address.'});
    return false;
  }
  var params = {
    TableName: options.TableName,
    Item: {
      Node: options.Node,
      Edge: options.Edge,
      MetaType: options.MetaType,
      UpdateTime: options.UpdateTime,
      Status: options.Status,
      GDN: options.GDN,
      OxygenID: options.OxygenID,
      Prefix: options.Prefix,
      InitialSuffix: options.InitialSuffix,
      CurrentSuffix: options.CurrentSuffix
    }
  };
  docClient.put(params, function (err, data) {
    if (err) {
      callback(undefined, err);
    }
    else {
      callback(params.Item.GDN);
    }
  });
}

function incrementSuffix (options, callback) {
  var params = {
    TableName: options.TableName,
    Key: {
      Node: options.Node,
      Edge: options.Edge
    },
    AttributeUpdates: {
      CurrentSuffix: {
        Action: 'PUT',
        Value: (parseInt(options.CurrentSuffix)+1)+''
      },
      UpdateTime: {
        Action: 'PUT',
        Value: options.UpdateTime
      }
    }
  };
  docClient.update(params, function (err, data) {
    if (err) {
      callback(undefined, err);
    }
    else {
      options.Node = guid.getGUID();
      options.GDN = options.Prefix+'-'+(parseInt(options.CurrentSuffix)+1);
      options.InitialSuffix = undefined;
      options.CurrentSuffix = undefined;
      addPrefix(options, callback);
    }
  });
}

function randomSuffix () {
  return (Math.floor(Math.random()*9000)+1000)+'';
}