'use strict'
var ottoman = require('ottoman');	
var couchbase=require('couchbase');
var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
cluster.authenticate('admin', 'admin1234');


// Build my cluster object and open a new cluster
var bk_header_presets = cluster.openBucket('pm_header_presets');
ottoman.store = new ottoman.CbStoreAdapter(bk_header_presets, couchbase);

// Build the necessary indexes to function
ottoman.ensureIndices(function(){});

function urlvalidation(val) {
    if(val == '') {
        throw new Error('url cannot be empty');
    }
};



var header_presets = ottoman.model('pm_header_presets',    {    
	itemid: {type:'string'},
	name : {type:'string'},
	timestamp: {type: 'Date', default:new Date()},
  headers:[{
    key: {type:'string'}, value: {type:'string'}, type: {type:'string'} 
  }]},  
  {
      index: {  
          findByItemID:{        // ← refdoc index
              by:'itemid'//,              type:'refdoc'
          }
      }
  });

header_presets.getAll = function(whendone)
{
  var q = couchbase.N1qlQuery.fromString("SELECT META().id AS id, pm_header_presets.* FROM pm_header_presets limit " + 100);
  bk_header_presets.query(
     q,
    whendone
);
//  bk_collections.query("select * from pm_colletions", whendone);
};

header_presets.insertItem = function (key, jsondata, whendone) {
    this.findByItemID(key, function(error, result) {
        if(result && result.length > 0) {
            bk_header_presets.replace(result.$.key, jsondata, whendone);            
        }
        else
        {
            var obj = new header_presets(jsondata);  
            obj.save(whendone); 
        }  
        
      });
};

header_presets.getItem = function (key, whendone) {

  this.findByItemID(key, whendone);   
};

header_presets.removeItem = function (key, whendone) {
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



module.exports = header_presets;	
