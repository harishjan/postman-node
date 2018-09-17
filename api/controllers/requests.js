'use strict';

var requestmodel = require('../models/requests');


exports.getAll = function(req, res) {
  
  requestmodel.getAll( function(err, done) {
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

exports.getrequestitems = function(req, res) {
  
  requestmodel.getItem(req.params.id, function(err, done) {
    if(err)
    {
        res.status=400;
        res.send(err.toString());
            return;
    }
    res.status=201;
    var done = done[0] || done;
    //console.log(result.value);
    res.send(done);    
    return;
    
    //res.json(result.value);
    
  });
};


exports.putrequestitem = function(req, res) {

  requestmodel.insertItem(req.params.id, req.body, function(err, result) {
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



exports.deleterequestitem = function(req, res) {
  requestmodel.removeItem(req.params.id, function(err, result) {
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