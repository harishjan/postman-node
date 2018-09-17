'use strict';

var headerpresetsmodel = require('../models/header_presets');

exports.getAll = function(req, res) {
  
  headerpresetsmodel.getAll( function(err, done) {
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


exports.getheaderpresetsitems = function(req, res) {
  
  headerpresetsmodel.getItem(req.params.id, function(err, done) {
    if(err)
    {
        res.status=400;
        res.send(err.toString());
            return;
    }
    res.status=201;
    var done = done[0] || done;
    res.send(done[0]);    
    return;
    
    //res.json(result.value);
    
  });
};


exports.putheaderpresetsitem = function(req, res) {

  headerpresetsmodel.insertItem(req.params.id, req.body, function(err, result) {
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



exports.deleteheaderpresetsitem = function(req, res) {
  headerpresetsmodel.removeItem(req.params.di, function(err, result) {
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