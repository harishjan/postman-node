'use strict';

var collectionmodel = require('../models/collections');
var promise = require('promise');

exports.getAll = function(req, res) {
  
  var collectiongetPromise = new promise(function(success, failed)  
  {
    collectionmodel.getAll( function(err, done) {
      if(err)
      {
        failed(err);
      }
      else
      {
        success(done);
      }
    });
  }); 
  

  collectiongetPromise.then((done) =>
    {
      res.status=201;
      console.log(done);
      res.json(done);  
    }
    ).catch((err) =>
    {
      res.status=400;
      res.json(err.toString());
      
      
    });
  
};


exports.getcollectionitems = function(req, res) {
  
  collectionmodel.getItem(req.params.id, function(err, done) {
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


exports.putcollectionitem = function(req, res) {

  collectionmodel.insertItem(req.params.id, req.body, function(err, result) {
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



exports.deletecollectionitem = function(req, res) {
  collectionmodel.removeItem(req.params.id, function(err, result) {
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