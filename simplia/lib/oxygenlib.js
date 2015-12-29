/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * � 2010-2015 Lotus Interworks Inc. (�LIW�) Proprietary and Trade Secret.
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

//var guid = require('guid');
//var gdn = require('gdn');
var guid = require('/opt/IDServices/node_modules/guid/index.js');
var gdn = require('/opt/IDServices/node_modules/gdn/index.js');
var async = require('async');
var util = require('util');

module.exports = function (params, config) {
    var module = {};
    var apps = params.apps;

    /**
     *
     * @param edge
     * @returns {Array}
     */
    module.parseOES = function (edge) {
        var encoding = edge.charAt(0);
        var segmentsStr = edge.slice(1);
        var exp = /.([^\x7F]+)\x7F/g;

        var match = exp.exec(segmentsStr);
        var matches = {
            segments: []
        };
        while (match != null) {
            //console.log('match:', match);
            matches.segments.push(match[1]);
            match = exp.exec(segmentsStr);
        }
        var postOESExp = /\x7F\x7F(.+)$/;
        var postOESMatch = postOESExp.exec(segmentsStr);
        if (postOESMatch != null) {
            matches.endString = postOESMatch[1];
        }
        return matches;
    };

    module.createOES = function (edgeEncoding, segments, endString) {
        var str = edgeEncoding;
        for (var i in segments) {
            str += segments[i].encoding + segments[i].segment + config.get('config.encodings.segmentSeparator');
        }
        return str + config.get('config.encodings.segmentSeparator') + (endString || "");
    };

    module.createSimpleOES = function (segmentStrings, endString) {
        var segments = [];
        for (var i in segmentStrings) {
            segments[i] = {encoding: config.get('config.encodings.defaultSegmentEncoding'), segment: segmentStrings[i]};
        }
        return module.createOES(config.get('config.encodings.defaultEdgeEncoding'), segments, endString || undefined);
    };

    module.createSimplePartialOES = function (segmentStrings) {
        var segments = [];
        for (var i in segmentStrings) {
            segments[i] = {encoding: config.get('config.encodings.defaultSegmentEncoding'), segment: segmentStrings[i]};
        }
        return module.createPartialOES(config.get('config.encodings.defaultEdgeEncoding'), segments);
    };

    module.createPartialOES = function (edgeEncoding, segments) {
        var str = edgeEncoding;
        for (var i in segments) {
            str += segments[i].encoding + segments[i].segment + config.get('config.encodings.segmentSeparator');
        }
        return str;
    };

    /**
     *
     * @param nodeId
     * @param label
     * @param linkedNodeId
     * @param callback
     */
    module.addLinkedEdge = function (nodeId, label, linkedNodeId, callback) {
        var params = {
            TableName: config.get('config.dynamodb.tables.components.tableName'),
            Item: {
                Node: nodeId,
                Edge: module.createSimpleOES([label, linkedNodeId])
            }
        };

        //console.log('addLinkedEdge-params:', params);
        apps.docClient.putItem(params, function (error) {
            callback(error, params.Item);
        });
    };

    /**
     *
     * @param nodeId
     * @param edgeString
     * @param callback
     */
    module.addEdge = function (nodeId, edgeString, callback) {
        var params = {
            TableName: config.get('config.dynamodb.tables.components.tableName'),
            Item: {
                Node: nodeId,
                Edge: edgeString
            }
        };

        console.log('addEdge-params.Item:', params.Item);

        apps.docClient.putItem(params, function (error) {
            callback(error, params.Item);
        });
    };

    module.removeEdge = function (nodeId, edge, callback) {
        var params = {
            TableName: config.get('config.dynamodb.tables.components.tableName'),
            Key: {
                Node: nodeId,
                Edge: edge
            }
        };

        apps.docClient.deleteItem(params, function (error) {
            callback(error);
        });
    };

    /**
     *
     * @param templateId
     * @param callback
     */
    module.getTemplate = function (templateId, callback) {
        var params = {
            TableName: config.get('config.dynamodb.tables.components.tableName'),
            Key: {}
        };
        params.Key.Node = templateId;
        params.Key.Edge = config.get('config.dynamodb.fixedValues.attributesEdge');

        console.log('get-template-params:', params);

        apps.docClient.getItem(params, function (error, data) {
            if (error) {
                console.log('get-template-error:', error);
            }
            console.log('template-data:', data);
            callback(error, ((typeof data !== "undefined") ? (data.Item || {}) : {}));
        });
    };

    /**
     *
     * @param templateItem
     * @param callback
     */
    module.getTypeFromTemplate = function (templateItem, callback) {
        var params = {
            TableName: config.get('config.dynamodb.tables.components.tableName'),
            Key: {}
        };
        params.Key.Node = templateItem.Type;
        params.Key.Edge = config.get('config.dynamodb.fixedValues.attributesEdge');

        //console.log('type-params:', params);

        apps.docClient.getItem(params, function (error, typeData) {
            if (error) {
                console.log('get-type-error:', error);
            }
            //console.log('type-data:', typeData);
            callback(error, templateItem, typeData.Item);
        });
    };

    /**
     *
     * @param nodeId
     * @param callback
     */
    module.getTip = function (nodeId, callback) {
        var params = {
            TableName: config.get('config.dynamodb.tables.components.tableName'),
            Key: {}
        };


        params.Key.Node = nodeId;
        params.Key.Edge = config.get('config.dynamodb.fixedValues.attributesEdge');
        //console.log('getTip-params:', params);
        apps.docClient.getItem(params, function (error, tipData) {
            var returnVal = {};
            if (!error) {
                returnVal = tipData.Item || {};
            }
            callback(error, returnVal);
        });
    };

    /**
     *
     * @param templateItem
     * @param typeItem
     * @param nodeId
     * @param tipData
     * @param callback
     */
    module.putServerTip = function (templateItem, templateData, typeItem, nodeId, tipData, mCallback) {
        async.waterfall([
            function (callback) {
                //Generate a display name if not already specified
                if (typeof tipData.DisplayName === "undefined") {
                    var options = {
                        GUID: nodeId,
                        Type: 'Simple',
                        Prefix: typeItem.DisplayName
                    };
                    module.createGDN(options, function (error, gdn) {
                        if (gdn) {
                            tipData.DisplayName = gdn;
                        }
                        callback(error);
                    });
                }
                else {
                    callback(null);
                }
            },
            function (callback) {
                var params = {
                    TableName: config.get('config.dynamodb.tables.components.tableName'),
                    Item: {
                        MetaType: config.get('config.dynamodb.metatypes.tip'),
                        Family: templateItem.Family,
                        Type: typeItem.Node,
                        Template: templateItem.Node,
                        OwnerID: templateItem.OwnerID,
                        OrganizationID: templateItem.OrganizationID,
                        AccountID: templateItem.AccountID,
                        CreationTime: (new Date()).toISOString(),
                        UpdateTime: (new Date()).toISOString(),
                        InitialContext: {Template: templateData}
                    }
                };

                params.Item.Node = nodeId;
                params.Item.Edge = config.get('config.dynamodb.fixedValues.attributesEdge');

                for (var i in tipData) {
                    params.Item[i] = tipData[i];
                }

                //console.log('putservertip-params:', params);

                apps.docClient.putItem(params, function (error) {
                    if (error) {
                        console.log('putServerTip-error:', error);
                    }
                    callback(error, params.Item);
                });
            }
        ], mCallback);
    };

    module.getEdges = function (nodeId, edgePrefix, mCallback) {
        var edges = [];

        async.waterfall([
            function (callback) {
                var params = {
                    TableName: config.get('config.dynamodb.tables.components.tableName'),
                    KeyConditionExpression: config.get('config.dynamodb.general.hashKey')
                    + ' = :hashkey AND ' + config.get('config.dynamodb.general.rangeKey')
                    + ' BETWEEN :lowrangekey AND :highrangekey',
                    ExpressionAttributeValues: {
                        ':hashkey': nodeId,
                        ':lowrangekey': edgePrefix + String.fromCharCode(0),
                        ':highrangekey': edgePrefix + String.fromCharCode(127)
                    }
                };

                console.log('getEdges-params:', params);
                apps.docClient.query(params, function (error, data) {
                    if (error) {
                        console.log('getEdges-query-error:', error);
                    }
                    //console.log('getEdges-data:', data);
                    var items = (typeof data !== "undefined" && data) ? data.Items : [];
                    callback(error, items);
                });
            },
            function (items, callback) {
                async.each(items, function (item, aCallback) {
                    var parsedString = module.parseOES(item.Edge);
                    //console.log('getEdges-parsedString:', parsedString);

                    //Including the entire edge
                    parsedString.edgeString = item.Edge;
                    edges.push(parsedString);
                    aCallback();
                }, function (error) {
                    callback(error);
                });
            }
        ], function (error) {
            mCallback(error, edges);
        });
    };

    /**
     * @param nodeId
     * @param label
     * @param mCallback
     * @param edgeValue
     */
    module.getLinkedEdges = function (nodeId, label, mCallback, edgeValue) {
        var edges = [];

        async.waterfall([
            function (callback) {
                var rangeKeyPrefix = config.get('config.encodings.defaultEdgeEncoding') + config.get('config.encodings.defaultSegmentEncoding') +
                    label + config.get('config.encodings.segmentSeparator') + (edgeValue || "");

                var params = {
                    TableName: config.get('config.dynamodb.tables.components.tableName'),
                    KeyConditionExpression: config.get('config.dynamodb.general.hashKey') + ' = :hashkey AND ' + config.get('config.dynamodb.general.rangeKey')
                    + ' BETWEEN :lowrangekey AND :highrangekey',
                    ExpressionAttributeValues: {
                        ':hashkey': nodeId,
                        ':lowrangekey': rangeKeyPrefix + String.fromCharCode(0),
                        ':highrangekey': rangeKeyPrefix + String.fromCharCode(127)
                    }
                };

                //console.log('getLinkedEdges-params:', params);
                apps.docClient.query(params, function (error, data) {
                    if (error) {
                        console.log('getLinkedEdges-query-error:', error);
                    }
                    //console.log('getLinkedEges-data:', data);
                    callback(error, data.Items || []);
                });
            },
            function (items, callback) {
                async.each(items, function (item, aCallback) {
                    var parsedString = module.parseOES(item.Edge);
                    //console.log('segments:', segments);
                    edges.push(parsedString.segments[1]);
                    aCallback();
                }, function (error) {
                    callback(error);
                });
            }
        ], function (error) {
            mCallback(error, edges);
        });
    };

    /**
     *
     * @param templateId
     * @param tipData
     * @param callback
     */
    module.createServerTip = function (templateId, templateData, tipData, callback) {
        //Initialize the server component
        async.waterfall([
            module.getTemplate.bind(module, templateId),
            module.getTypeFromTemplate.bind(module),
            function (templateItem, typeItem, callback) {
                if (typeof tipData.Node === "undefined") {
                    module.getGUID(function (error, guid) {
                        callback(error, templateItem, typeItem, guid);
                    });
                }
                else {
                    callback(null, templateItem, typeItem, tipData.Node);
                }
            },
            function (templateItem, typeItem, nodeId, callback) {
                if (typeof tipData.DisplayName === "undefined") {
                    var options = {
                        GUID: nodeId,
                        Type: 'Simple',
                        Prefix: templateItem.DisplayName
                    };
                    module.createGDN(options, function (error, gdn) {
                        tipData.DisplayName = gdn;
                        callback(null, templateItem, typeItem, nodeId)
                    })
                }
                else {
                    callback(null, templateItem, typeItem, nodeId);
                }
            },
            function (templateItem, typeItem, nodeId, callback) {
                module.putServerTip(templateItem, templateData, typeItem, nodeId, tipData, callback);
            }
        ], function (error, tipData) {
            //console.log('tipData:',tipData);
            callback(error, tipData);
        });
    };

    /**
     *
     * @param nodeId
     * @param callback
     * @param override
     */
    module.awakenServerTip = function (nodeId, mCallback, override) {
        var serverTip;
        var overrideFlag = override || false;

        if (typeof params.allTips[nodeId] !== "undefined") {
            return mCallback();
        }

        async.waterfall([
            function (callback) {
                module.getTip(nodeId, callback);
            },
            function (tip, callback) {
                serverTip = tip;
                //console.log('awakenServerTip-tip:', tip);
                module.getTemplate(tip.Template, callback);
            },
            function (templateItem, callback) {
                //console.log('awakenServerTip-template:', templateItem);
                if (templateItem.Node == templateItem.RootTemplate) {
                    callback(null, templateItem, templateItem);
                }
                else {
                    module.getTemplate(templateItem.RootTemplate, function (error, rootTemplateItem) {
                        callback(error, templateItem, rootTemplateItem);
                    });
                }
            },
            function (templateItem, rootTemplateItem, callback) {
                apps.redis.sadd('tips', serverTip.Node, function (error, addReply) {
                    callback(error, templateItem, rootTemplateItem, addReply);
                });
            },
            function (templateItem, rootTemplateItem, addReply, callback) {
                //console.log('addReply:', addReply);
                if (addReply || overrideFlag) {
                    ///usr/local/apps/simplia/server_components/oxygenhome.js
                    //var Type = require(rootTemplateItem.Code.TipInstance);
                    var Type = require(rootTemplateItem.Code.TipInstance.replace("/usr/local/apps/simplia/", "../"));

                    var context = serverTip.CurrentContext || serverTip.InitialContext || {};

                    params.allTips[serverTip.Node] = new Type(
                        {
                            globals: params,
                            context: context,
                            template: templateItem.Code,
                            ids: {
                                serverTypeId: serverTip.Type,
                                serverTemplateId: templateItem.Node,
                                nodeId: serverTip.Node
                            },
                            config: config,
                            oxygenLib: module,
                            tip: serverTip
                        },
                        function () {
                            return callback();
                        }
                    );
                }
                else {
                    callback();
                }
            }
        ], mCallback)
    };

    /**
     *
     */
    module.createRelation = function () {
        var mainArguments = arguments;
        module.getGUID(function (error, nodeId) {
            var params = {
                TableName: config.get('config.dynamodb.tables.relations.tableName'),
                Item: {
                    RelationDN: mainArguments[0]
                }
            };

            for (var i = 1; i <= mainArguments.length - 2; i++) {
                params.Item['ARG' + i] = mainArguments[i];
            }
            params.Item.Node = nodeId;
            params.Item.Edge = config.get('config.dynamodb.fixedValues.attributesEdge');

            //console.log('relation-params:', params);

            apps.docClient.putItem(params, function (error) {
                if (error) {
                    console.log('createRelation-error:', error);
                }
                mainArguments[mainArguments.length - 1](error, params.Item);
            });
        });
    };

    module.getRelatedComponent = function (relationName, argName, argValue, callback) {
        if (!config.get('config.dynamodb.tables.relations.indices.' + argName)) {
            return callback('Invalid argument name');
        }

        var params = {
            TableName: config.get('config.dynamodb.tables.relations.tableName'),
            IndexName: config.get('config.dynamodb.tables.relations.indices.' + argName),
            KeyConditionExpression: 'RelationDN = :RelationDN AND ' + argName + ' = :ArgValue',
            ExpressionAttributeValues: {
                ':RelationDN': relationName,
                ':ArgValue': argValue
            }
        };

        async.waterfall([
            apps.docClient.query.bind(apps.docClient, params),
            function (queryData, callback) {
                if (!queryData || !queryData.Items.length) {
                    return callback('No relation found');
                }
                var compParams = {
                    TableName: config.get('config.dynamodb.tables.components.tableName'),
                    Key: {
                        Node: queryData.Items[0].ARG1,
                        Edge: config.get('config.dynamodb.fixedValues.attributesEdge')
                    }
                };
                apps.docClient.getItem(compParams, callback);
            }
        ], function (error, itemData) {
            if (error) {
                return callback(error);
            }
            callback(error, itemData.Item);
        });
    };

    module.addPermission = function (nodeId, permissionAttributes) {
        //console.log('addPermission-arguments:', arguments);
        var mCallback = arguments[arguments.length - 1];

        var edgePath = "";
        if (typeof arguments[2] !== "function") {
            edgePath = arguments[2];
        }
        var params = {
            TableName: config.get('config.dynamodb.tables.permissions.tableName'),
            Item: permissionAttributes
        };

        params.Item.Node = nodeId;
        params.Item.Edge = config.get('config.dynamodb.fixedValues.attributesEdge');

        var parsedString = module.parseOES(params.Item.OnObjectFTT);
        var FTTSegments = parsedString.segments;

        //Verify that permissionAttributes contain all the necessary details
        async.waterfall([
            function (callback) {
                if (typeof params.Item.OnObjectDN === "undefined") {
                    //var index = ( (FTTSegments.length - 1) >= 0 ) ? (FTTSegments.length - 1) : 0;
                    var options = {
                        Prefix: FTTSegments[0],
                        Type: 'Simple',
                        GUID: params.Item.OnObject
                    };
                    module.createGDN(options, callback);
                }
                else {
                    callback(null, params.Item.OnObjectDN);
                }
            },
            function (gdn, callback) {
                //console.log('addPermission-params:', params);
                apps.docClient.putItem(params, function (error, data) {
                    if (error) {
                        console.log('adPermission-putItem-error:', error);
                    }
                    callback(error, gdn);
                });
            },
            function (gdn, callback) {
                edgePath = edgePath || module.createSimpleOES(
                        [
                            config.get('config.encodings.labels.resources'),
                            params.Item.InThread,
                            FTTSegments[0],
                            FTTSegments[2],
                            gdn
                        ], params.Item.Node
                    );
                console.log('addPermission-edgePath:', edgePath);
                module.addEdge(
                    params.Item.AllowedToAccount,
                    edgePath,
                    callback
                )
            }
        ], function (error) {
            if (error) {
                console.log('addPermission-error:', error);
            }
            mCallback(error, params.Item);
        });
    };

    /**
     *
     * @param nodeId
     * @param callback
     */
    module.getPermission = function (nodeId, callback) {
        var params = {
            TableName: config.get('config.dynamodb.tables.permissions.tableName'),
            Key: {
                Node: nodeId,
                Edge: config.get('config.dynamodb.fixedValues.attributesEdge')
            }
        };

        apps.docClient.getItem(params, function (error, tipData) {
            var returnVal = {};
            if (!error) {
                returnVal = tipData.Item || {};
            }
            callback(error, returnVal);
        });
    };

    module.getPermissions = function (indexType, expressionNames, expressionValues, filterExpression, callback) {
        var params = {
            TableName: config.get('config.dynamodb.tables.permissions.tableName')
        };

        var typeSelection = {
            'thread': function () {
                params.IndexName = config.get('config.dynamodb.tables.permissions.indices.thread');
                params.KeyConditionExpression = 'InThread = :InThread';

            },
            'object': function () {
                params.IndexName = config.get('config.dynamodb.tables.permissions.indices.object');
                params.KeyConditionExpression = 'OnObject = :OnObject';
            },
            'allowedTo': function () {
                params.IndexName = config.get('config.dynamodb.tables.permissions.indices.allowedTo');
                params.KeyConditionExpression = 'AllowedToAccount = :AllowedToAccount';
            }
        };

        typeSelection[indexType]();
        if (Object.keys(expressionNames).length) {
            params.ExpressionAttributeNames = expressionNames;
        }
        if (Object.keys(expressionValues).length) {
            params.ExpressionAttributeValues = expressionValues;
        }

        if (filterExpression) {
            params.FilterExpression = filterExpression;
        }

        //console.log('getPermissions-params:', params);

        apps.docClient.query(params, function (error, data) {
            if (error) {
                console.log('getPermissions-error:', error);
            }
            //console.log('getPermissions-data:', data);
            callback(error, data.Items || []);
        });
    };

    module.getMetaTypes = function (metatype, callback) {
        var params = {
            TableName: config.get('config.dynamodb.tables.components.tableName'),
            IndexName: config.get('config.dynamodb.tables.components.indices.metatype'),
            KeyConditionExpression: 'MetaType = :metatype',
            ExpressionAttributeValues: {
                ':metatype': metatype
            }
        };

        apps.docClient.query(params, function (error, data) {
            if (error) {
                console.log('getMetaTypes-error:', error);
            }
            //console.log('getMetaTypes-data:', data);
            callback(error, data.Items || []);
        });
    };

    module.getGUID = function (callback) {
        try {
            guid.getGUID(function (guid) {
                //console.log('guid:', guid);
                callback(null, guid);
            });
        }
        catch (e) {
            callback('Unable to generate GUID');
        }
    };

    module.getGUIDSync = function () {
        return guid.getGUID();
    };

    module.createGDN = function (options, callback) {
        gdn.createGDN(options, function (gdn, error) {
            if (gdn) {
                callback(null, gdn);
            }
            else {
                callback(error);
            }
        });
    };

    module.createTreeSource = function (items) {
        var treeSource = [], elementList = {}, lastNode = {};
        var currentInsertArray = treeSource, currentELNode = elementList;

        for (var i = 0; i < items.length; i++) {
            currentInsertArray = treeSource;
            currentELNode = elementList;
            for (var j = 0; j < items[i].path.length; j++) {
                var nodeName = items[i].path[j];
                var node = {};
                if (typeof currentELNode[nodeName] === "undefined") {
                    node = {
                        title: nodeName,
                        key: nodeName,
                        folder: true,
                        children: []
                    };
                    var newLength = currentInsertArray.push(node);
                    currentELNode[nodeName] = {index: newLength - 1, children: {}};
                }
                else {
                    node = currentInsertArray[currentELNode[nodeName].index];
                }

                lastNode = node;
                currentInsertArray = node.children;
                currentELNode = currentELNode[nodeName].children;
            }
            lastNode.key = items[i].id;
            lastNode.info = items[i].info;
            delete lastNode.children;
            delete lastNode.folder;
        }
        return treeSource;
    };

    module.getTipFTT = function (nodeId, mCallback) {
        async.waterfall([
            module.getTip.bind(module, nodeId),
            function (tipItem, callback) {
                module.getTemplate(tipItem.Template, function (error, templateItem) {
                    callback(error, tipItem, templateItem);
                });
            },
            function (tipItem, templateItem, callback) {
                module.getTypeFromTemplate(templateItem, function (error, templateItem, typeItem) {
                    callback(error, tipItem, templateItem, typeItem);
                });
            }
        ], function (error, tipItem, templateItem, typeItem) {
            var FTT = module.createSimpleOES([
                typeItem.Family,
                typeItem.DisplayName,
                templateItem.DisplayName
            ]);
            mCallback(error, FTT);
        });
    };

    module.addActiveSessionsSpoke1 = function (properties, callback) {
        if (typeof properties.Node === "undefined") {
            return callback("Node ID is not specified");
        }

        var params = {
            TableName: config.get('config.dynamodb.tables.activesessionsspoke1.tableName'),
            Item: {
                UpdateTime: (new Date()).toISOString()
            }
        };

        for (var i in properties) {
            params.Item[i] = properties[i];
        }

        console.log('addActiveSessionsSpoke1:', params);
        apps.docClient.putItem(params, function (error, data) {
            if (error) {
                console.log('addActiveSessionsSpoke1-error:', error);
            }
            callback(error, params.Item);
        });
    };

    module.addActiveSessionsSpoke2 = function (properties, callback) {
        if (typeof properties.Node === "undefined") {
            return callback("Node ID is not specified");
        }

        var params = {
            TableName: config.get('config.dynamodb.tables.activesessionsspoke2.tableName'),
            Item: {
                UpdateTime: (new Date()).toISOString()
            }
        };

        for (var i in properties) {
            params.Item[i] = properties[i];
        }

        console.log('addActiveSessionsSpoke2:', params);
        apps.docClient.putItem(params, function (error, data) {
            if (error) {
                console.log('addActiveSessionsSpoke1-error:', error);
            }
            callback(error, params.Item);
        });
    };

    module.markActiveSessionsSpokesInactive = function (sessionId, mCallback) {
        async.waterfall([
            function (callback) {
                var params = {
                    TableName: config.get('config.dynamodb.tables.activesessionsspoke1.tableName'),
                    IndexName: config.get('config.dynamodb.tables.activesessionsspoke1.indices.session'),
                    KeyConditionExpression: '#S = :session',
                    ExpressionAttributeValues: {
                        ':session': sessionId
                    },
                    ExpressionAttributeNames: {
                        '#S': 'Session'
                    }
                };

                apps.docClient.query(params, function (error, data) {
                    if (error) {
                        console.log('markActionsSessionsSpokesInactive-error:', error);
                        return callback(error);
                    }
                    callback(null, data.Items || []);
                });
            },
            function (spokes, callback) {
                async.each(spokes, function (spoke, aCallback) {
                    async.waterfall([
                        function (inCallback) {
                            var params = {
                                TableName: config.get('config.dynamodb.tables.activesessionsspoke1.tableName'),
                                Key: {
                                    Node: spoke.Node,
                                    Edge: spoke.Edge
                                },
                                UpdateExpression: 'SET #R = :relation',
                                ExpressionAttributeValues: {
                                    ':relation': config.get('config.dynamodb.tables.activesessionsspoke1.relations.inactive')
                                },
                                ExpressionAttributeNames: {
                                    '#R': 'Relation'
                                }
                            };
                            apps.docClient.updateItem(params, function (error) {
                                inCallback(error);
                            });
                        },
                        function (inCallback) {
                            var params = {
                                TableName: config.get('config.dynamodb.tables.activesessionsspoke2.tableName'),
                                Key: {
                                    Node: spoke.Node,
                                    Edge: spoke.Edge
                                },
                                UpdateExpression: 'SET #R = :relation',
                                ExpressionAttributeValues: {
                                    ':relation': config.get('config.dynamodb.tables.activesessionsspoke2.relations.inactive')
                                },
                                ExpressionAttributeNames: {
                                    '#R': 'Relation'
                                }
                            };
                            apps.docClient.updateItem(params, inCallback);
                        }
                    ], aCallback);
                }, callback);
            }
        ], mCallback);
    };

    module.getMetadata = function (tableName, updateTime, callback) {
        var params = {
            TableName: config.get('config.dynamodb.tables.metadata.tableName'),
            Key: {
                TableName: tableName,
                UpdateTime: updateTime
            }
        };

        console.log('getItem-params:', params);
        apps.docClient.getItem(params, function (error, itemData) {
            if (error) {
                console.log('getItem-error:', error);
                return callback(error);
            }
            else if ((typeof itemData.Item === "undefined") || (typeof itemData.Item.SchemaList === "undefined")) {
                return callback("Couldn't find the data attribute");
            }
            callback(null, itemData);
        });
    };

    module.updateTipContext = function (tipId, context, callback) {
        var params = {
            TableName: config.get('config.dynamodb.tables.components.tableName'),
            Key: {
                Node: tipId,
                Edge: config.get('config.dynamodb.fixedValues.attributesEdge')
            },
            UpdateExpression: 'SET #C = :context',
            ExpressionAttributeValues: {
                ':context': context
            },
            ExpressionAttributeNames: {
                '#C': 'CurrentContext'
            }
        };
        apps.docClient.updateItem(params, function (error) {
            callback(error);
        });
    };

    module.getS3SignedUrl = function (key, callback) {
        var params = {
            Bucket: config.get('config.s3.bucket'),
            Key: key
            //Expires: '60'
        };

        apps.s3.getSignedUrl('getObject', params, callback);
    };

    module.updateS3ObjectACL = function (key, ACL, callback) {
        var params = {
            Bucket: config.get('config.s3.bucket'),
            Key: key,
            ACL: ACL
            /*
             AccessControlPolicy: {
             Grants: [
             {
             Grantee: {
             Type: 'CanonicalUser'
             }
             }
             ]
             }
             */
        };

        console.log('updateS3ObjectACL-params:', params);
        apps.s3.putObjectAcl(params, function (error) {
            if (error) {
                console.log('updateS3ObjectACL-error:', error);
            }
            callback(error);
        });
    };

    module.getRegisteredAccount = function (username, callback) {
        var params = {
            TableName: config.get('config.dynamodb.tables.registeredaccounts.tableName'),
            IndexName: config.get('config.dynamodb.tables.registeredaccounts.indices.username'),
            KeyConditionExpression: 'Username = :username',
            ExpressionAttributeValues: {
                ':username': username //data.data.Username
            }
        };

        apps.docClient.query(params, function (error, queryData) {
            if (error) {
                callback(null);
            }
            else if ((typeof queryData === "undefined") || !queryData.Items.length) {
                callback("Cannot find username");
            }
            else {
                callback(null, queryData.Items[0]);
            }
        });
    };

    return module;
};