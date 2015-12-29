module.exports = {
    "config": {
        "express": {
            "serverPort": 3010,
            "sizeLimit": '100mb',
            "routes": {
                "main": "/index.html",
                "upload": "/upload",
                "config": "/config",
                "panels": "/panels",
                "fullAppBase": "http://nodejs.simplia.com/simplia"
            }
        },
        "redis": {
            "redisServerPort": 6379,
            "redisServer": "redis.simplia.com"
        },
        "aws": {
            "awsRegion": "us-east-1"
        },
        "resetEmail": {
            "subject": "Instructions to reset your password",
            "urlPrefix": "http://nodejs.simplia.com/simplia/resetpwd/",
            "adminEmailAccount": "admin"
        },
        "passwordEncryption": {
            "saltLength": 8
        },
        "s3": {
            "bucket": "service2015",
            "urlPrefix": "https://service2015.s3.amazonaws.com/",
            "maxUpload": "1024mb"
        },
        "dynamodb": {
            "general": {
                "hashKey": "Node",
                "rangeKey": "Edge",
                "codeAttr": "Code"
            },
            "metatypes": {
                "tip": "Tip",
                "type": "Type",
                "template": "Template"
            },
            "tables": {
                "codes": {
                    "tableName": "TrackingCodes"
                },
                "components": {
                    "tableName": "OxygenComponents",
                    "indices": {
                        "metatype": "MetaType-index"
                    },
                    "metatdataUpdateTime": "2015:09:08:14:00"
                },
                "metadata": {
                    "tableName": "MetaTable"
                },
                "anonymousaccounts": {
                    "tableName": "AnonymousAccountProfiles"
                },
                "relations": {
                    "tableName": "Relations",
                    "indices": {
                        "ARG1": "RelationDN-ARG1-index",
                        "ARG2": "RelationDN-ARG2-index",
                        "ARG3": "RelationDN-ARG3-index",
                        "ARG4": "RelationDN-ARG4-index",
                        "ARG5": "RelationDN-ARG5-index"
                    }
                },
                "permissions": {
                    "tableName": "Permissions",
                    "indices": {
                        "object": "OnObject-index",
                        "allowedTo": "AllowedToAccount-index",
                        "thread": "InThread-index"
                    }
                },
                "registeredaccounts": {
                    "tableName": "RegisteredAccountProfiles",
                    "indices": {
                        "username": "Username-index"
                    }
                },
                "activesessionsspoke1": {
                    "tableName": "ActiveSessionsSpoke1",
                    "indices": {
                        "session": "Session-Relation-index"
                    },
                    "relations": {
                        "infocus": "InFocus",
                        "open": "Open",
                        "inactive": "Inactive"
                    }
                },
                "activesessionsspoke2": {
                    "tableName": "ActiveSessionsSpoke2",
                    "indices": {
                    },
                    "relations": {
                        "infocus": "InFocus",
                        "open": "Open",
                        "inactive": "Inactive"
                    }
                }
            },
            "fixedValues": {
                "attributesEdge": "0"
            },
            "families": {
                "resources": {
                    "name": "Resources",
                    "types": {
                        "registeredaccount": {
                            "name": "RegisteredAccount",
                            "rootTemplates": {
                                "registeredaccount" : {
                                    "name": "RegisteredAccount"
                                }
                            }
                        },
                        "anonymousaccount": {
                            "name": "AnonymousAccount",
                            "rootTemplates": {
                                "anonymousaccount" : {
                                    "name": "AnonymousAccount"
                                }
                            }
                        },
                        "oxygencatalog": {
                            "name": "OxygenCatalog",
                            "rootTemplates": {
                                "oxygencatalog" : {
                                    "name": "OxygenCatalog"
                                }
                            }
                        },
                        "mogopak": {
                            "name": "Mogopak",
                            "rootTemplates": {
                                "mogopak" : {
                                    "name": "Mogopak"
                                }
                            }
                        }
                    }
                },
                "views": {
                    "name": "Views",
                    "types": {
                        "registeredaccount": {
                            "name": "RegisteredAccount",
                            "rootTemplates": {
                                "registeredaccount" : {
                                    "name": "RegisteredAccount"
                                }
                            }
                        },
                        "anonymousaccount": {
                            "name": "AnonymousAccount",
                            "rootTemplates": {
                                "anonymousaccount" : {
                                    "name": "AnonymousAccount"
                                }
                            }
                        }
                    }
                },
                "threads": {
                    "name": "Threads",
                    "types": {
                        "oxygenhomethread": {
                            "name": "OxygenHomeThread",
                            "rootTemplates": {
                                "oxygenhomethread" : {
                                    "name": "OxygenHomeThread"
                                }
                            }
                        },
                        "anonymousthread": {
                            "name": "AnonymousThread",
                            "rootTemplates": {
                                "anonymousthread" : {
                                    "name": "AnonymousThread"
                                }
                            }
                        },
                        "homethread": {
                            "name": "HomeThread",
                            "rootTemplates": {
                                "homethread" : {
                                    "name": "HomeThread"
                                }
                            }
                        }
                    }
                },
                "files": {
                    "name": "Files",
                    "types": {
                        "uploadedfile": {
                            "name": "UploadedFile",
                            "rootTemplates": {
                                "basicfile": {
                                    "name": "BasicFile"
                                }
                            }
                        }
                    }
                }
            },
            "types": {
            }
        },
        "cookies": {
            "data": {
                "path": "/",
                "domain": ".simplia.com"
            },
            "names": {
                "userId": "userid",
                "sessionId": "sessionid",
                "commandData": "commanddata"
            }
        },
        "twilio": {
            "accountSid": "AC3a2fe56e26f6e1b1deca9bb14d5bcbc8",
            "authToken": "dd47be33e5c5106fc920383b14df09dc",
            "simpliaLine": {
                "number": "+13107362085",
                "SID": "AP416b4ce7e8162ea2e73f7363896192ff"
            }
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
        "routes": {
            "rootDir": "./../extraroutes/",
            "suffix": ".js"
        },
        "nodeIds": {
            "templates": {
                "registration": {
                    "server": "2015-08-20T20:42:22.650053Z000-0000Z",
                    "client": "2015-08-24T19:32:19.454011Z000-0000Z"
                },
                "anonymousaccount": {
                    "server": "2015-08-20T20:55:43.530090Z000-0000Z",
                    "client": ""
                },
                "anonymousthread": {
                    "server": "2015-08-25T22:16:13.879011Z000-0000Z"
                },
                "registeredaccount": {
                    "server": "2015-09-12T01:01:50.413010Z000-0000Z"
                },
                "homethread": {
                    "server": "2015-09-15T21:50:25.838037Z000-0000Z"
                },
                "basicfile": {
                    "id": "2015-10-21T20:44:25.419011Z000-0000Z"
                },
                "basicmogopak": {
                    "id": "2015-10-30T00:39:49.944044Z000-0000Z"
                },
                "basicactivesession": {
                    "id": "2015-11-16T21:06:01.719151Z000-0000Z"
                },
                "dynamodbviewer": {
                    "server": "2015-12-01T22:36:03.227308Z000-0000Z"
                },
                "samplepanel": {
                    "server": "2015-12-23T01:23:01.490043Z000-0000Z",
                    "client": "2015-12-10T23:25:05.348149Z000-0000Z"
                },
                "ode": {
                    "server": "2015-12-10T23:10:57.253151Z000-0000Z",
                    "client": "2015-12-10T23:25:05.348149Z000-0000Z"
                }
            },
            "types": {
                "registration": {
                    "server": "2015-08-20T20:20:24.461036Z000-0000Z"
                },
                "anonymousaccount": {
                    "server": "2015-08-20T20:48:19.765009Z000-0000Z"
                },
                "homethread": {
                    "server": "2015-08-25T22:00:30.700011Z000-0000Z"
                },
                "anonymousthread": {
                    "server": "2015-08-25T22:14:13.736011Z000-0000Z"
                },
                "uploadedfile": {
                    "id": "2015-10-21T20:06:55.553035Z000-0000Z"
                },
                "mogopakpage": {
                    "id": "2015-10-30T00:30:48.953032Z000-0000Z"
                },
                "registeredaccount": {
                    "server": "2015-09-12T00:39:21.940350Z000-0000Z"
                },
                "dynamodbviewer": {
                    "server": "2015-12-01T22:31:19.399799Z000-0000Z"
                },
                "samplepanel": {
                    "server": "2015-12-23T01:01:04.640260Z000-0000Z"
                }
            },
            "tips": {
                "homethread": "2015-08-27T17:45:53.255037Z000-0000Z",
                "oxygencatalog": "2015-09-18T18:40:32.836012Z000-0000Z",
                "mogopak": "2015-09-30T20:19:07.273011Z000-0000Z",
                "samplepanel": "2015-12-23T01:28:33.775025Z000-0000Z"
            }
        },
        "oxygenAccounts": {
            "OwnerID": "2015-08-25T21:55:21.946032Z000-0000Z",
            "OrganizationID": "2015-08-25T21:56:54.898039Z000-0000Z",
            "AccountsIDs": {
                "types": "2015-08-25T21:59:10.379011Z000-0000Z",
                "tips": "2015-08-25T21:59:27.959011Z000-0000Z"
            }
        },
        "encodings": {
            "defaultEdgeEncoding": "1",
            "defaultSegmentEncoding": "1",
            "segmentSeparator": String.fromCharCode(127),
            "labels": {
                "views": "compatibleViews",
                "anonymousthread": "anonymousthread",
                "branchedthread": "branchedthread",
                "homethread": "homethread",
                "threads": "threads",
                "resources": "resources"
            }
        },
        "relations": {
            "anonymousaccount": "AnonymousProfile",
            "registeredaccount": "RegisteredProfile"
        },
        "typeServers": {
            "anonymousaccount": "anonymousaccount_type",
            "anonymousthread": "anonymousthread_type",
            "registration": "registration_type"
        },
        "roles": {
            "anonymousUser": "user",
            "registeredUser": "registeredUser",
            "buyer": "buyer",
            "author": "author",
            "developer": "developer"
        },
        "plupload": {
            "uploadLimit": "100"
        }
    }
};
