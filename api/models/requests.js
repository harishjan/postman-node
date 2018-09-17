'use strict'
var ottoman = require('ottoman');	
var couchbase=require('couchbase');
var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
cluster.authenticate('admin', 'admin1234');


// Build my cluster object and open a new cluster
var bk_requests = cluster.openBucket('pm_requests');
ottoman.store = new ottoman.CbStoreAdapter(bk_requests, couchbase);

// Build the necessary indexes to function
ottoman.ensureIndices(function(){});

function urlvalidation(val) {
    if(val == '') {
        throw new Error('url cannot be empty');
    }
};

var requests = ottoman.model('pm_requests',    {  
	dataMode: {type:'string'},
	headers : {type:'string'},
	itemid: {type:'string'},
	method: {type:'string'},
	timestamp: {type: 'Date', default:new Date()},
	url: {type:'string', validator: urlvalidation},
	data:[{}],
  version: {type:'string'}
  },
  {
      index: {  
          findByItemID:{        // ← refdoc index
              by:'itemid'//,              type:'refdoc'
          }
      }
  });
requests.getAll = function(whendone)
{
  var q = couchbase.N1qlQuery.fromString("SELECT META().id AS id, pm_requests.* FROM pm_requests limit " + 100);
    bk_requests.query(
    q,
    whendone
  );
};

requests.insertItem = function (key, jsondata, whendone) {    
    this.findByItemID(key, function(error, result) {
        if(result && result.length > 0) {
            var key =result[0].$.key || result.$.key;
            bk_requests.replace(key, jsondata, whendone);            
        }
        else
        {
            var obj = new requests(jsondata);  
            obj.save(
              function(err) {
                if (err) return console.error(err);
              whendone();
            }); 
        }  
        
      });
};

requests.getItem = function (key, whendone) {

  this.findByItemID(key, whendone);   
};

requests.removeItem = function (key, whendone) {
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



module.exports = requests;	
