'use strict'
var ottoman = require('ottoman');	
var couchbase=require('couchbase');
var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
cluster.authenticate('admin', 'admin1234');


// Build my cluster object and open a new cluster
var bk_collections = cluster.openBucket('pm_colletions');
bk_collections.enableN1ql('localhost:8091');
ottoman.store = new ottoman.CbStoreAdapter(bk_collections, couchbase);

// Build the necessary indexes to function
ottoman.ensureIndices(function(){});

function urlvalidation(val) {
    if(val === '') {
        throw new Error('url cannot be empty');
    }
};

function nonullvalue(val) {
  if(val === '') {
        throw new Error('Value cannot be empty');
    }
}

var collection = ottoman.model('pm_colletions',   
{    
	itemid: {type:'string', validator:nonullvalue},
	name : {type:'string'},
  order : {type:'string'},
	timestamp: {type: 'Date', default:new Date()}
},
{
    index: {	
        findByItemID:{				// ← refdoc index
            by:'itemid'//,            type:'refdoc'
        }
    }
}
);

collection.getAll = function(whendone)
{
  var q = couchbase.N1qlQuery.fromString("SELECT META().id AS id, pm_colletions.* FROM pm_colletions limit " + 100);
  bk_collections.query(
     q,
    whendone
);
//  bk_collections.query("select * from pm_colletions", whendone);
};

collection.insertItem = function (key, jsondata, whendone) {
    this.findByItemID(key, function(error, result) {
        if(result && result.length > 0) {
            bk_collections.replace(result.$.key, jsondata, whendone);            
        }
        else
        {
            var newcollection = new collection(jsondata);  
            newcollection.save(whendone); 
        }  
        
      });
};

collection.getItem = function (key, whendone) {

  this.findByItemID(key, whendone);   
};

collection.removeItem = function (key, whendone) {
    this.findByItemID(key, function(error, result) {
        if(result && result.length  > 0) {
            result.remove(whendone);            
        }
        else
        {
            whendone(JSON.stringify({message:'record not found'})); 
        }  
        
      });
};

module.exports = collection;	
