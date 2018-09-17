'use strict'
var ottoman = require('ottoman');	
var couchbase=require('couchbase');
var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
cluster.authenticate('admin', 'admin1234');


// Build my cluster object and open a new cluster
var bk_environments = cluster.openBucket('pm_environments');
ottoman.store = new ottoman.CbStoreAdapter(bk_environments, couchbase);

// Build the necessary indexes to function
ottoman.ensureIndices(function(){});

function urlvalidation(val) {
    if(val == '') {
        throw new Error('url cannot be empty');
    }
};



var environments = ottoman.model('pm_environments',    {    
	itemid: {type:'string'},
	name : {type:'string'},
	timestamp: {type: 'Date', default:new Date()},
  values:[{
      key: {type:'string'}, value: {type:'string'}, type: {type:'string'} 
    }]
  },
    
  {
    index: {  
        findByItemID:{        // ← refdoc index
            by:'itemid'//,            type:'refdoc'
        }
    }
  });

environments.getAll = function(whendone)
{
  var q = couchbase.N1qlQuery.fromString("SELECT META().id AS id, pm_environments.* FROM pm_environments limit " + 100);
  bk_environments.query(
     q,
    whendone
);
//  bk_collections.query("select * from pm_colletions", whendone);
};

environments.insertItem = function (key, jsondata, whendone) {
    this.findByItemID(key, function(error, result) {
        if(result && result.length > 0) {
            bk_environments.replace(result.$.key, jsondata, whendone);            
        }
        else
        {
            var obj = new environments(jsondata);  
            obj.save(whendone);         
        };
  })
};

environments.getItem = function (key, whendone) {

  this.findByItemID(key, whendone);   
};

environments.removeItem = function (key, whendone) {
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

module.exports = environments;	
