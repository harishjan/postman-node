'use strict';

var collrequestmodel = require('../models/collection_requests');

exports.deleteAll = function(req, res) {
  
  collrequestmodel.deleteAll( function(err, done) {
    if(err)
    {
        res.status=400;
        res.send(err.toString());
            return;
    }
    res.status=201;
    console.log(done);
    res.send(done);    
    return;;
    
  });
};

exports.getAll = function(req, res) {
  
  collrequestmodel.getAll( function(err, done) {
    if(err)
    {
        res.status=400;
        res.send(err.toString());
            return;
    }
    res.status=201;
    console.log(done);
    res.send(done);    
    return;
    
    //res.json(result.value);
    
  });
};

exports.getcollrequestitems = function(req, res) {
  
  collrequestmodel.getItem(req.params.id, function(err, done) {
    if(err)
    {
        res.status=400;
        res.send(err.toString());
            return;
    }
    res.status=201;
    var done = done[0] || done;
    res.send(done);    
    return;
    
    //res.json(result.value);
    
  });
};


exports.putcollrequestitems = function(req, res) {

  collrequestmodel.insertItem(req.params.id, req.body, function(err, result) {
  if(err)
    {
        res.status=400;
        res.send(err.toString());
            return;
    }
    res.status=201;

  res.json({"Message": "Inserted/Updated successfully"}); 
  });
};



exports.deletecollrequestmodel = function(req, res) {
  collectionitems.removeItem(req.params.id, function(err, result) {
  if(err)
    {
        res.status=400;
        res.send(err.toString());
            return;
    }
    res.status=201;

  res.json({"Message": "Item deleted successfully"}); 
  });
};