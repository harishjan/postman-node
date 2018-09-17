'use strict';

var environmentmodel = require('../models/environments');

exports.getAll = function(req, res) {
  
  environmentmodel.getAll( function(err, done) {
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

exports.getenvironmentitems = function(req, res) {
  
  environmentmodel.getItem(req.params.id, function(err, done) {
    if(err)
    {
        res.status=400;
        res.send(err.toString());
            return;
    }
    res.status=201;
    var done = done[0] || done;
    console.log(done);
    res.send(done);    
    return;
    
    //res.json(result.value);
    
  });
};


exports.putenvironmentitem = function(req, res) {

  environmentmodel.insertItem(req.params.id, req.body, function(err, result) {
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



exports.deleteenvironmentitem = function(req, res) {
  environmentmodel.removeItem(req.params.id, function(err, result) {
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