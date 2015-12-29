module.exports = {
    "express": {
        "serverPort": 3005
    },
    "redis": {
        "redisServerPort": 6379,
        "redisServer": "redis.simplia.com"
    },
    "aws": {
        "awsRegion": "us-east-1",
        "cognitoUsername": "dev6@lotusrings.com",
        "cognitoPassword": "Hbe001Lrs",
        "cognitoIdentity": {
            "apiVersion": "2014-06-30"
        }
    },
    "resetEmail": {
        "subject": "Instructions to reset your password",
        "urlPrefix": "http://nodejs.simplia.com/simplia/resetpwd/",
        "adminEmailAccount": "admin"
    },
    "passwordEncryption": {
        "saltLength": 8
    },
    "dynamodb": {
        "general": {
            "hashKey": "Node",
            "rangeKey": "Edges",
        },
        "tables": {
            "accounts": {
                "tableName": "Accounts",
                "hashKey": "Node",
                "rangeKey": "Edges",
                "sectorCode": "SectorCode",
                "accountCode": "AccountCode",
                "updateTime": "UpdateTime",
                "indexes": {
                    "accountName": "AccountName-index"
                }
            },
            "codes": {
                "tableName": "TrackingCodes"
            },
            "anonymoususers": {
                "tableName": "AnonymousVisitors",
                "hashKey": "Node",
                "rangeKey": "Edges",
                "indexes": {
                    "accountName": "AccountName-index"
                }
            },
            "components": {
                "tableName": "OxygenComponents"
            },
            "whiteboardsnaps": {
                "tableName": "WhiteboardSnaps",
                "indexes": {
                    "imageKey": "ImageKey-index"
                }
            },
            "whiteboardepisodes": {
                "tableName": "WhiteboardEpisodes",
                "indexes": {
                    "episodeKey": "EpisodeKey-index"
                }
            },
            "mediaSegments": {
                "tableName": "MediaSegments",
                "hashKey": "Node",
                "rangeKey": "Edge",
                "cycleCount": "CycleCount",
                "Status": "Status",
                "updateTime": "UpdateTime",
                "startingTime": "StartingTime",
                "endingTime": "EndingTime",
                "mediaType": "MediaType",
                "mediaLocation": "MediaLocation",
                "indexes": {
                    "T1": "T1-index",
                    "T2": "T2-index",
                }
            },
            "BFSTTesting": {
                "tableName": "BFSTTesting",
                "hashKey": "Node",
                "rangeKey": "Edge",
                "metatype": "MetaType",
                "updatetime": "UpdateTime",
                "status": "Status",
                "cyclecount": "CycleCount",
                "t1": "T1",
                "t2": "T2",
                "bfsttemplatestarting": "BFSTTemplateStarting",
                "bfsttemplatedraft": "BFSTTemplateDraft",
                "bfsttemplatefinal": "BFSTTemplateFinal",
                "initialcontext": "InitialContext",
                "currentcontext": "CurrentContext",
                "finalcontext": "FinalContext",
                "indexes": {
                    "node": "Node-index"
                }
            },
            "MetaTable": {
                "tableName": "MetaTable",
                "tableName-attribute": "TableName",
                "updateTime": "UpdateTime",
                "schemaList": "SchemaList",
                "indexes": {
                    "tableName": "TableName"
                }
            }
        },
        "fixedValues": {
            "attributesEdge": "0"
        }
    },
    "sqlite": {
        "tables": {
            "mediaSegments": {
                "tableName": "MediaSegments",
                "fields": {
                    "Node": "TEXT",
                    "Edge": "TEXT",
                    "CycleCount": "INT",
                    "Status": "TEXT",
                    "updateTime": "TEXT",
                    "T1": "TEXT",
                    "T2": "TEXT",
                    "StartingTime": "TEXT",
                    "EndingTime": "TEXT",
                    "MediaType": "TEXT",
                    "MediaLocation": "TEXT"
                },
                "dynamodbTypes": {
                    "Node": "String",
                    "Edge": "String",
                    "StartingTime": "String",
                    "MediaType": "String",
                }
            },
            "bfstTesting": {
                "tableName": "BFSTTesting",
                "fields": {
                    "Node": "TEXT",
                    "Edge": "TEXT",
                    "MetaType": "TEXT",
                    "UpdateTime": "TEXT",
                    "Status": "TEXT",
                    "CycleCount": "INTEGER",
                    "T1": "TEXT",
                    "T2": "TEXT",
                    "BFSTTemplateStarting": "TEXT",
                    "BFSTTemplateDraft": "TEXT",
                    "BFSTTemplateFinal": "TEXT",
                    "InitialContext": "TEXT",
                    "CurrentContext": "TEXT",
                    "FinalContext": "TEXT",
                    "Code": "TEXT",
                    "Content": "TEXT"
                },
                "dynamodbTypes": {
                    "TableName": "String",
                    "UpdateTime": "String",
                    "SchemaList": "String"
                }
            }

        }
    },
    "nodeId": {
        "sectorId": "A",
        "serviceId": "A",
        "separator": String.fromCharCode(127),
        "count": 0
    },
    "cookies": {
        "path": "/",
        "domain": ".simplia.com"
    },
    "twilio": {
        "accountSid": "AC3a2fe56e26f6e1b1deca9bb14d5bcbc8",
        "authToken": "dd47be33e5c5106fc920383b14df09dc",
        "simpliaLine": {
            "number": "+13107362085",
            "SID": "AP416b4ce7e8162ea2e73f7363896192ff"
        }
    },
    "developersetup": {
        "url": "http://nodejsdev.simplia.com:10001/create"
    },
    "cognitoadd": {
        "url": "http://nodejs.simplia.com:5000/serviceapi/cognitoadd"
    },
    "portassignservice": {
        "url": "http://nodejs.simplia.com/portassignservice/",
        "portTypes": {
            "application": "application",
            "debug": "debugging"
        },
        "defaultNumPorts": 10,
        "developmentServerName": "nodejsdev.simplia.com"
    },
    "mysql": {
        "host": "lotusrdsinstance.cladr7eisf0t.us-east-1.rds.amazonaws.com",
        "port": "3309",
        "user": "lotususer",
        "db": "lotuscore"
    },
    "db": {
        "defaultSchema": "lotuscore",
        "translationsTable": {
            "tableName": "global_column_translations",
            languageCols: {
                "english": "english_name"
            }
        }
    },
    "guid": {
        "sector_code": "000",
        "service_code": "0000"
    }
}
