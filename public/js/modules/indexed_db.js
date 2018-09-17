pm.indexedDB = {
    TABLE_HEADER_PRESETS: "header_presets",

    onerror:function (event, callback) {
        console.log(event);
    },

    open_v21:function () {

        var request = indexedDB.open("postman", "POSTman request history");
        request.onsuccess = function (e) {
            var v = "0.6";
            pm.indexedDB.db = e.target.result;
            var db = pm.indexedDB.db;

            //We can only create Object stores in a setVersion transaction
            if (v !== db.version) {
                var setVrequest = db.setVersion(v);

                setVrequest.onfailure = function (e) {
                    console.log(e);
                };

                setVrequest.onsuccess = function (event) {
                    //Only create if does not already exist
                    if (!db.objectStoreNames.contains("requests")) {
                        var requestStore = db.createObjectStore("requests", {keyPath:"itemid"});
                        requestStore.createIndex("timestamp", "timestamp", { unique:false});
                    }

                    if (!db.objectStoreNames.contains("collections")) {
                        var collectionsStore = db.createObjectStore("collections", {keyPath:"itemid"});
                        collectionsStore.createIndex("timestamp", "timestamp", { unique:false});
                    }

                    if (!db.objectStoreNames.contains("collection_requests")) {
                        var collectionRequestsStore = db.createObjectStore("collection_requests", {keyPath:"itemid"});
                        collectionRequestsStore.createIndex("timestamp", "timestamp", { unique:false});
                        collectionRequestsStore.createIndex("collectionId", "collectionId", { unique:false});
                    }

                    if (db.objectStoreNames.contains("collection_responses")) {
                        db.deleteObjectStore("collection_responses");
                    }

                    if (!db.objectStoreNames.contains("environments")) {
                        var environmentsStore = db.createObjectStore("environments", {keyPath:"itemid"});
                        environmentsStore.createIndex("timestamp", "timestamp", { unique:false});
                        environmentsStore.createIndex("itemid", "itemid", { unique:false});
                    }

                    if (!db.objectStoreNames.contains("header_presets")) {
                        var requestStore = db.createObjectStore("header_presets", {keyPath:"itemid"});
                        requestStore.createIndex("timestamp", "timestamp", { unique:false});
                    }

                    var transaction = event.target.result;
                    transaction.oncomplete = function () {
                        pm.history.getAllRequests();
                        pm.envManager.getAllEnvironments();
                        pm.headerPresets.init();
                    };
                };

                setVrequest.onupgradeneeded = function (evt) {
                };
            }
            else {
                pm.history.getAllRequests();
                pm.envManager.getAllEnvironments();
                pm.headerPresets.init();
            }

        };

        request.onfailure = pm.indexedDB.onerror;
    },

    open_latest:function () {

        var v = 11;
        var request = indexedDB.open("postman", v);
        request.onupgradeneeded = function (e) {

            var db = e.target.result;
            pm.indexedDB.db = db;
            if (!db.objectStoreNames.contains("requests")) {
                var requestStore = db.createObjectStore("requests", {keyPath:"itemid"});
                requestStore.createIndex("timestamp", "timestamp", { unique:false});
            }

            if (!db.objectStoreNames.contains("collections")) {
                var collectionsStore = db.createObjectStore("collections", {keyPath:"itemid"});
                collectionsStore.createIndex("timestamp", "timestamp", { unique:false});
            }

            if (!db.objectStoreNames.contains("collection_requests")) {
                var collectionRequestsStore = db.createObjectStore("collection_requests", {keyPath:"itemid"});
                collectionRequestsStore.createIndex("timestamp", "timestamp", { unique:false});
                collectionRequestsStore.createIndex("collectionId", "collectionId", { unique:false});
            }

            if (db.objectStoreNames.contains("collection_responses")) {
                db.deleteObjectStore("collection_responses");
            }

            if (!db.objectStoreNames.contains("environments")) {
                var environmentsStore = db.createObjectStore("environments", {keyPath:"itemid"});
                environmentsStore.createIndex("timestamp", "timestamp", { unique:false});
                environmentsStore.createIndex("itemid", "itemid", { unique:false});
            }

            if (!db.objectStoreNames.contains("header_presets")) {
                var requestStore = db.createObjectStore("header_presets", {keyPath:"itemid"});
                requestStore.createIndex("timestamp", "timestamp", { unique:false});
            }
        };

        request.onsuccess = function (e) {
            pm.indexedDB.db = e.target.result;
            pm.history.getAllRequests();
            pm.envManager.getAllEnvironments();
            pm.headerPresets.init();
        };

        request.onerror = pm.indexedDB.onerror;
    },

    open:function () {
        if (parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) < 23) {
            pm.indexedDB.open_v21();
        }
        else {
            pm.indexedDB.open_latest();
        }

        pm.couchsave.urlcollectiongetall().then(()=>{}).catch((err) => {
            console.log("error opening couchbasedb, data will not be saved in couchbasedb : " + err )
        })
    },

    addCollection:function (collection, callback) {
        var db = pm.indexedDB.db;
        var trans = db.transaction(["collections"], "readwrite");
        var store = trans.objectStore("collections");

        var request;

        if("order" in collection) {
            var col = {
                "itemid":collection.itemid,
                "name":collection.name,
                "order":collection.order,
                "timestamp":new Date().getTime()
            };

            //request = store.put(col);
            request =pm.couchsave.urlcollectioninsert(col.itemid, col)

        }
        else {
            var col = {
                "itemid":collection.itemid,
                "name":collection.name,
                "timestamp":new Date().getTime()
            }
            //request = store.put(col);
            store.put(col);
            request = pm.couchsave.urlcollectioninsert(col.itemid, col)
        }


        //request.onsuccess = function () {
        request.then(function () {
            callback(collection);
        },
        function (e) {
            console.log(e);
        });
    },

    updateCollection:function (collection, callback) {
        var db = pm.indexedDB.db;
        var trans = db.transaction(["collections"], "readwrite");
        var store = trans.objectStore("collections");

        var boundKeyRange = IDBKeyRange.only(collection.itemid);
        //var request = store.put(collection);
        store.put(collection);
        var request = pm.couchsave.urlcollectioninsert(collection.itemid, collection)
        //request.onsuccess = function (e) {
        request.then(function (e) {
            callback(collection);
        },
        function (e) {
            console.log(e);
        });
    },

    addCollectionRequest:function (req, callback) {
        var db = pm.indexedDB.db;
        var trans = db.transaction(["collection_requests"], "readwrite");
        var store = trans.objectStore("collection_requests");

        var version;

        if ("version" in req) {
            version = req.version;
        }
        else {
            version = 1;
        }
        var col = {
            "collectionId":req.collectionId,
            "itemid":req.itemid,
            "name":req.name,
            "description":req.description,
            "url":req.url.toString(),
            "method":req.method.toString(),
            "headers":req.headers.toString(),
            "data":req.data,
            "dataMode":req.dataMode.toString(),
            "timestamp":req.timestamp,
            "responses":req.responses,
            "version":req.version
        };
        var collectionRequest = pm.couchsave.urlcollrequestinsert(col.itemid, col)

        //var collectionRequest = store.put();
        store.put();
        //collectionRequest.onsuccess = function () {
        collectionRequest.then(function () {
            callback(req);
        },
        function (e) {
            console.log(e);
        });
    },

    updateCollectionRequest:function (req, callback) {
        var db = pm.indexedDB.db;
        var trans = db.transaction(["collection_requests"], "readwrite");
        var store = trans.objectStore("collection_requests");

        var boundKeyRange = IDBKeyRange.only(req.itemid);
        var request = pm.couchsave.urlcollrequestinsert(req.itemid, req)
        //var request = store.put(req);
        store.put(req);

        //request.onsuccess = function (e) {
        request.then(function (e) {
            callback(req);
        },
        function (e) {
            console.log(e);
        });
    },

    getCollection:function (itemid, callback) {
        var db = pm.indexedDB.db;
        var trans = db.transaction(["collections"], "readwrite");
        var store = trans.objectStore("collections");

        //Get everything in the store
        //var cursorRequest = store.get(itemid);
        store.get(itemid);
        var cursorRequest = pm.couchsave.urlcollectionget(itemid)
        //cursorRequest.onsuccess = function (e) {
        cursorRequest.then((e)=>{
            var result = e;
            callback(result);
        },
        (err) =>
        {
            console.log(err);    
        });
    },

    getCollections:function (callback) {
        var db = pm.indexedDB.db;

        if (db == null) {
            return;
        }

        var trans = db.transaction(["collections"], "readwrite");
        var store = trans.objectStore("collections");

        //Get everything in the store
        var keyRange = IDBKeyRange.lowerBound(0);
        //var cursorRequest = store.openCursor(keyRange);
        store.openCursor(keyRange);
        var cursorRequest = pm.couchsave.urlcollectiongetall();
        //var numCollections = 0;
        var items = [];
        //cursorRequest.onsuccess = function (e) {
            cursorRequest.then(function (e) {
                var results = e;
                if(undefined === results)
                {
                    callback(items);
                    return;
                }

                results.forEach((val)=>{
                    items.push(val);    
                });
                callback(items);            
        },function (e) {
            console.log(e);
        });
    },

    getAllRequestsInCollection:function (collection, callback) {
        var db = pm.indexedDB.db;
        var trans = db.transaction(["collection_requests"], "readwrite");

        //Get everything in the store
        var keyRange = IDBKeyRange.only(collection.itemid);
        var store = trans.objectStore("collection_requests");

        var index = store.index("collectionId");
        index.openCursor(keyRange);
        var cursorRequest = pm.couchsave.urlcolrequestsall();
        var requests = [];

        cursorRequest.then(function (e) {
            var results = e;
            if(undefined === results)
            {
                callback(requests);
                return;
            }

            results.forEach((val)=>{
                requests.push(val);    
            });
                
        },
        //cursorRequest.onerror = pm.indexedDB.onerror;
        (e) =>
        {
            console.log(e);
        });
    },

    addRequest:function (historyRequest, callback) {
        var db = pm.indexedDB.db;
        var trans = db.transaction(["requests"], "readwrite");
        var store = trans.objectStore("requests");
        store.put(historyRequest);
        var request = pm.couchsave.urlrequestinsert(historyRequest.itemid,historyRequest);
        request.then(function (e) {
            callback(historyRequest);
        },
        function (e) {
            console.log(e);
        });
    },

    getRequest:function (itemid, callback) {
        var db = pm.indexedDB.db;
        var trans = db.transaction(["requests"], "readwrite");
        var store = trans.objectStore("requests");

        //Get everything in the store
        store.get(itemid);
        var cursorRequest = pm.couchsave.urlrequestget(itemid);
        cursorRequest.then(function (e) {
            var result = e;
            if (!result) {
                return;
            }

            callback(result);
        },
        (e)=>{
            console.log(e);
        });
    },

    getCollectionRequest:function (itemid, callback) {
        var db = pm.indexedDB.db;
        var trans = db.transaction(["collection_requests"], "readwrite");
        var store = trans.objectStore("collection_requests");

        //Get everything in the store
        store.get(itemid);
        var cursorRequest = pm.couchsave.urlcollrequestget(itemid);
        cursorRequest.then(function (e) {
            var result = e;
            if (!result) {
                return;
            }

            callback(result);
            return result;
        },
        (e) => {
            console.log(e);
        });
    },


    getAllRequestItems:function (callback) {
        var db = pm.indexedDB.db;
        if (db == null) {
            return;
        }

        var trans = db.transaction(["requests"], "readwrite");
        var store = trans.objectStore("requests");

        //Get everything in the store
        var keyRange = IDBKeyRange.lowerBound(0);
        var index = store.index("timestamp");
        index.openCursor(keyRange);
        var cursorRequest = pm.couchsave.urlrequestsall();
        var historyRequests = [];

        cursorRequest.then(function (e) {
            var results = e;
            if(undefined === results)
            {
                callback(historyRequests);
                return;
            }

            results.forEach((val)=>{
                historyRequests.push(val);    
            });
            callback(historyRequests);
            
        },
        (e)=>{
           console.log(e); 
        });
    },

    deleteRequest:function (itemid, callback) {
        try {
            var db = pm.indexedDB.db;
            var trans = db.transaction(["requests"], "readwrite");
            var store = trans.objectStore(["requests"]);

            store['delete'](itemid);
            var request = pm.couchsave.urlrequestdelete(itemid);    
            request.then(function () {
                callback(itemid);
            },function (e) {
                console.log(e);
            });
        }
        catch (e) {
            console.log(e);
        }
    },

    deleteHistory:function (callback) {
        var db = pm.indexedDB.db;
        var clearTransaction = db.transaction(["requests"], "readwrite");
        var clearRequest = clearTransaction.objectStore(["requests"]).clear();
        clearRequest.onsuccess = function (event) {
            callback();
        };

        console.log("Delete history will not work for all the records from couchbase, delete records individually");
    },

    deleteCollectionRequest:function (itemid, callback) {
        var db = pm.indexedDB.db;
        var trans = db.transaction(["collection_requests"], "readwrite");
        var store = trans.objectStore(["collection_requests"]);

        store['delete'](itemid);
        var request = pm.couchsave.urlcollrequestdelete(itemid);
        request.then(function (e) {
            callback(itemid);
        },
        function (e) {
            console.log(e);
        });
    },

    deleteAllCollectionRequests:function (itemid) {
        var db = pm.indexedDB.db;
        var trans = db.transactio


        n(["collection_requests"], "readwrite");

        //Get everything in the store
        var keyRange = IDBKeyRange.only(itemid);
        var store = trans.objectStore("collection_requests");

        var index = store.index("collectionId");
        var cursorRequest = index.openCursor(keyRange);

        cursorRequest.onsuccess = function (e) {
            var result = e.target.result;

            if (!result) {
                return;
            }

            var request = result.value;
            pm.collections.deleteCollectionRequest(request.itemid);
            result['continue']();
        };
        cursorRequest.onerror = pm.indexedDB.onerror;
        var requestpro = pm.couchsave.urlcolrequestalldelete(itemid);
        requestpro.then((e) => {},(e)=>
        {
            console.log(e);
        });
        //todo:
        //console.log("Delete collection_requests will not work for all the records from couchbase, delete records individually");
    },

    deleteCollection:function (itemid, callback) {
        var db = pm.indexedDB.db;
        var trans = db.transaction(["collections"], "readwrite");
        var store = trans.objectStore(["collections"]);

        store['delete'](itemid);
        var request = pm.couchsave.urlcollectiondelete(itemid);
        request.then(function (e) {
            //todo: this is not implemented in couchdb
            pm.indexedDB.deleteAllCollectionRequests(itemid);
            callback(itemid);
        },
        function (e) {
            console.log(e);
        });
    },

    environments:{
        addEnvironment:function (environment, callback) {
            var db = pm.indexedDB.db;
            var trans = db.transaction(["environments"], "readwrite");
            var store = trans.objectStore("environments");
            store.put(environment);
            var request = pm.couchsave.urlenvironmentget(environment.itemid, environment);
            request.then(function (e) {
                callback(environment);
            },
            function (e) {
                console.log(e);
            });
        },

        getEnvironment:function (itemid, callback) {
            var db = pm.indexedDB.db;
            var trans = db.transaction(["environments"], "readwrite");
            var store = trans.objectStore("environments");

            //Get everything in the store
            store.get(itemid);
            var cursorRequest = pm.couchsave.urlenvironmentget(itemid);
            cursorRequest.then(function (e) {
                var result = e;
                callback(result);
            },
            (e)=>
            {
                console.log(e);
            });
        },

        deleteEnvironment:function (itemid, callback) {
            var db = pm.indexedDB.db;
            var trans = db.transaction(["environments"], "readwrite");
            var store = trans.objectStore(["environments"]);

            store['delete'](itemid);
            var request = pm.couchsave.urlenvironmentdelete(itemid);
            request.then(function () {
                callback(itemid);
            },
            function (e) {
                console.log(e);
            });
        },

        getAllEnvironments:function (callback) {
            var db = pm.indexedDB.db;
            if (db == null) {
                return;
            }

            var trans = db.transaction(["environments"], "readwrite");
            var store = trans.objectStore("environments");

            //Get everything in the store
            var keyRange = IDBKeyRange.lowerBound(0);
            var index = store.index("timestamp");
            index.openCursor(keyRange);
            var cursorRequest = pm.couchsave.urlenvironmentsall();
            var environments = [];

            cursorRequest.then(function (e) {
                var results = e;
                if(undefined === results)
                {
                    callback(environments);
                    return;
                }

                results.forEach((val)=>{
                    environments.push(val);
                });
                    
                callback(environments);
            },
            (e)=>{
                console.log(e);
            });
        },

        updateEnvironment:function (environment, callback) {
            var db = pm.indexedDB.db;
            var trans = db.transaction(["environments"], "readwrite");
            var store = trans.objectStore("environments");

            var boundKeyRange = IDBKeyRange.only(environment.itemid);
            store.put(environment);
            var request = pm.couchsave.urlenvironmentinsert(environment.itemid)
            request.then(function (e) {
                callback(environment);
            },
            function (e) {
                console.log(e);
            });
        }
    },

    headerPresets:{
        addHeaderPreset:function (headerPreset, callback) {
            var db = pm.indexedDB.db;
            var trans = db.transaction([pm.indexedDB.TABLE_HEADER_PRESETS], "readwrite");
            var store = trans.objectStore(pm.indexedDB.TABLE_HEADER_PRESETS);
            store.put(headerPreset);
            var request = pm.couchsave.urlheaderpresetinsert(headerPreset.itemid, headerPreset);
            request.then(function (e) {
                callback(headerPreset);
            },
            function (e) {
                console.log(e);
            });
        },

        getHeaderPreset:function (itemid, callback) {
            var db = pm.indexedDB.db;
            var trans = db.transaction([pm.indexedDB.TABLE_HEADER_PRESETS], "readwrite");
            var store = trans.objectStore(pm.indexedDB.TABLE_HEADER_PRESETS);

            //Get everything in the store
            store.get(itemid);
            var cursorRequest = pm.couchsave.urlheaderpresetget(itemid);
            cursorRequest.then(function (e) {
                var result = e;
                callback(result);
            },
            (e)=>
            {
                console.log(e);
            });
        },

        deleteHeaderPreset:function (itemid, callback) {
            var db = pm.indexedDB.db;
            var trans = db.transaction([pm.indexedDB.TABLE_HEADER_PRESETS], "readwrite");
            var store = trans.objectStore([pm.indexedDB.TABLE_HEADER_PRESETS]);

            store['delete'](itemid);
            var request = pm.couchsave.urlheaderpresetdelete(itemid);
            request.then(function () {
                callback(itemid);
            },
            function (e) {
                console.log(e);
            });
        },

        getAllHeaderPresets:function (callback) {
            var db = pm.indexedDB.db;
            if (db == null) {
                console.log("Db is null");
                return;
            }

            var trans = db.transaction([pm.indexedDB.TABLE_HEADER_PRESETS], "readwrite");
            var store = trans.objectStore(pm.indexedDB.TABLE_HEADER_PRESETS);

            //Get everything in the store
            var keyRange = IDBKeyRange.lowerBound(0);
            var index = store.index("timestamp");
            index.openCursor(keyRange);
            var cursorRequest = pm.couchsave.urlheaderpresetsall();
            var headerPresets = [];

            cursorRequest.then(function (e) {
                var results = e;
                if(undefined === results)
                {
                    callback(headerPresets);
                    return;
                }

                results.forEach((val)=>{
                    headerPresets.push(val);    
                });              
                callback(headerPresets);
            },
            (e)=>{
                 console.log(e);
            });
        },

        updateHeaderPreset:function (headerPreset, callback) {
            var db = pm.indexedDB.db;
            var trans = db.transaction([pm.indexedDB.TABLE_HEADER_PRESETS], "readwrite");
            var store = trans.objectStore(pm.indexedDB.TABLE_HEADER_PRESETS);

            var boundKeyRange = IDBKeyRange.only(headerPreset.itemid);
            store.put(headerPreset);
            var request = pm.couchsave.urlheaderpresetinsert(headerPreset.itemid, headerPreset);
            request.then(function (e) {
                callback(headerPreset);
            },
            function (e) {
                console.log(e);
            });
        }
    },

    downloadAllData: function(callback) {
        console.log("Starting to download all data");

        //Get globals
        var totalCount = 0;
        var currentCount = 0;
        var collections = [];
        var globals = [];
        var environments = [];
        var headerPresets = [];

        var onFinishGettingCollectionRequests = function(collection) {
            var requests = collection.requests;
            console.log("Found collection", collection);
            for(var i = 0; i < requests.length; i++) {
                console.log(requests[i].name);

                if (requests[i].hasOwnProperty("name")) {
                    if (typeof requests[i].name === "undefined") {
                        console.log("No name found");
                        requests[i].name = requests[i].url;
                    }
                }
                else {
                    console.log("No name found");
                    requests[i].name = requests[i].url;
                }
            }

            collections.push(collection);

            currentCount++;

            if (currentCount === totalCount) {
                onFinishExportingCollections(collections);
            }
        }

        var onFinishExportingCollections = function(c) {
            console.log(pm.envManager);

            globals = pm.envManager.globals;

            //Get environments
            pm.indexedDB.environments.getAllEnvironments(function (e) {
                environments = e;
                pm.indexedDB.headerPresets.getAllHeaderPresets(function (hp) {
                    headerPresets = hp;
                    onFinishExporttingAllData(callback);
                });
            });
        }

        var onFinishExporttingAllData = function() {
            console.log("collections", collections);
            console.log("environments", environments);
            console.log("headerPresets", headerPresets);
            console.log("globals", globals);

            var dump = {
                version: 1,
                collections: collections,
                environments: environments,
                headerPresets: headerPresets,
                globals: globals
            };

            var name = "Backup.postman_dump";
            var filedata = JSON.stringify(dump);
            var type = "application/json";

            console.log("File data is ", filedata);

            pm.filesystem.saveAndOpenFile(name, filedata, type, function () {
                if (callback) {
                    callback();
                }
            });
        }

        //Get collections
        //Get header presets
        pm.indexedDB.getCollections(function (items) {
            totalCount = items.length;
            pm.collections.items = items;
            var itemsLength = items.length;

            function onGetAllRequestsInCollection(collection, requests) {
                collection.requests = requests;
                onFinishGettingCollectionRequests(collection);
            }

            if (itemsLength !== 0) {
                for (var i = 0; i < itemsLength; i++) {
                    var collection = items[i];
                    pm.indexedDB.getAllRequestsInCollection(collection, onGetAllRequestsInCollection);
                }
            }
            else {
                globals = pm.envManager.globals;

                pm.indexedDB.environments.getAllEnvironments(function (e) {
                    environments = e;
                    pm.indexedDB.headerPresets.getAllHeaderPresets(function (hp) {
                        headerPresets = hp;
                        onFinishExporttingAllData(callback);
                    });
                });
            }
        });
    }
};