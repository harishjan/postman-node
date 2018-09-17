'use strict';
module.exports = function(app) {
  	var collection = require('../controllers/collections');
  	var collection_requests = require('../controllers/collection_request');
  	var requests = require('../controllers/requests');
	var environments = require('../controllers/environments');
	var header_presets = require('../controllers/header_presets');
  
 
	app.route('/collection/:id')
	    .get(collection.getcollectionitems)
	    .put(collection.putcollectionitem)
	    .delete(collection.deletecollectionitem);
	
	app.route('/collectionall')
		.get(collection.getAll);		

	app.route('/collection_requests/:id')
	    .get(collection_requests.getcollrequestitems)
	    .put(collection_requests.putcollrequestitems)
	    .delete(collection_requests.deletecollrequestmodel);

	app.route('/collection_requestsall')
		.get(collection_requests.getAll)
		
    
    app.route('/collection_requestsall/:id')
    	.delete(collection_requests.deleteAll);

	app.route('/requests/:id')
	    .get(requests.getrequestitems)
	    .put(requests.putrequestitem)
	    .delete(requests.deleterequestitem);

	app.route('/requestsall')
		.get(requests.getAll);

	app.route('/environments/:id')
	    .get(environments.getenvironmentitems)
	    .put(environments.putenvironmentitem)
	    .delete(environments.deleteenvironmentitem);

	app.route('/environmentsall')
		.get(environments.getAll);

	app.route('/header_presets/:id')
	    .get(header_presets.getheaderpresetsitems)
	    .put(header_presets.putheaderpresetsitem)
	    .delete(header_presets.deleteheaderpresetsitem);

	app.route('/header_presetsall')
		.get(header_presets.getAll);

};