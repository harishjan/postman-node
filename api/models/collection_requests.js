'use strict'
var ottoman = require('ottoman');	
var couchbase=require('couchbase');
var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
cluster.authenticate('admin', 'admin1234');


// Build my cluster object and open a new cluster
var bk_collection_requests = cluster.openBucket('pm_collection_requests');
ottoman.store = new ottoman.CbStoreAdapter(bk_collection_requests, couchbase);

// Build the necessary indexes to function
ottoman.ensureIndices(function(){});

function urlvalidation(val) {
    if(val == '') {
        throw new Error('url cannot be empty');
    }
};


var collection_requests = ottoman.model('pm_collection_requests',   {
    collectionId: {type:'string'},//{type:'string', auto:'uuid', readonly:true},	// ← auto-increment UUID
	data : {type:'string'},
	dataMode: {type:'string'},
	description: {type:'string'},
	headers : {type:'string'},
	itemid: {type:'string'},
	method: {type:'string'},
	name : {type:'string'},
	responses:[{}],
	timestamp: {type: 'Date', default:new Date()},
	url: {type:'string',validator: urlvalidation},
	version: {type:'string'},
},
{
    index: {	
        findByItemID:{				// ← refdoc index
            by:'itemid'//,            type:'refdoc'
        },
        findBycollectionID:{				// ← refdoc index
            by:'collectionId'//,            type:'refdoc'
        }
    }
}
);

collection_requests.deleteAll = function(id, whendone)
{
	var q = couchbase.N1qlQuery.fromString("delete from pm_collection_requests where collectionId = "+ id);
	 bk_collection_requests.query(
	     q,
	    whendone
	);
};
collection_requests.getAll = function(whendone)
{
  var q = couchbase.N1qlQuery.fromString("SELECT META().id AS id, pm_collection_requests.* FROM pm_collection_requests limit " + 100);
  bk_collection_requests.query(
     q,
    whendone
);
//  bk_collections.query("select * from pm_colletions", whendone);
};

collection_requests.insertItem = function (key, jsondata, whendone) {
    this.findByItemID(key, function(error, result) {
        if(result && result.length > 0) {
        	var key =result[0].$.key || result.$.key;
            bk_collection_requests.replace(key, jsondata, whendone);            
        }
        else
        {
            var obj = new collection_requests(jsondata);  
            obj.save(whendone); 
        }  
        
      }); 
};

collection_requests.getItem = function (key, whendone) {

  this.findByItemID(key, whendone);   
};

collection_requests.removeItem = function (key, whendone) {
    this.findByItemID(key, function(error, result) {
        if(result && result.length  > 0) {
        	var data = result[0] || result;
            data.remove(whendone);            
        } 
        else
        {
            whendone(JSON.stringify({message:'record not found'})); 
        }  
        
      });
};

module.exports = collection_requests;	
