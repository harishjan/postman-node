pm.couchsave = {
    host:'http://localhost:3001/',
    urlcollectionget : function(itemid){
        return this.get(this.host + 'collection/' + itemid);
    },
    urlcollectioninsert : function(itemid, data){
        return this.put(this.host + 'collection/' + itemid, data);
    },
    urlcollectiondelete : function(itemid){
        return this.delete(this.host + 'collection/' + itemid);
    },
    //
    urlrequestget : function(itemid){
         return this.get(this.host + 'requests/'+ itemid);
    },
    urlrequestinsert : function(itemid, data){
        return this.put(this.host + 'requests/' + itemid, data);
    },
    urlrequestdelete : function(itemid){
        return this.delete(this.host + 'requests/'+ itemid);
    },
    //
    urlcollrequestget : function(itemid){
        return this.get(this.host + 'collection_requests/' + itemid);
    },
    urlcollrequestinsert : function(itemid, data){
        return this.put(this.host + 'collection_requests/' + itemid, data);
    },
    urlcollrequestdelete : function(itemid){
        return this.delete(this.host + 'collection_requests/'+ itemid);
    },
    //
    urlenvironmentget : function(itemid){
        return this.get(this.host + 'environments/'+ itemid);
    },
    urlenvironmentinsert : function(itemid, data){
        return this.put(this.host + 'environments/' + itemid, data);
    },
    urlenvironmentdelete : function(itemid){
        return this.delete(this.host + 'environments/'+ itemid);
    },
    //
    urlheaderpresetget : function(itemid){
        return this.get(this.host + 'header_presets/'+ itemid);
    },
    urlheaderpresetinsert : function(itemid, data){
        return this.put(this.host + 'header_presets/' + itemid, data);
    },
    urlheaderpresetdelete : function(itemid){
        return this.delete(this.host + 'header_presets/'+ itemid);
    },
    //
    urlenvironmentsall : function(){
        return this.get(this.host + 'environmentsall/');
    },
    urlheaderpresetsall : function(){
        return this.get(this.host + 'header_presetsall/');
    },
    urlcollectiongetall : function(){
        return this.get(this.host + 'collectionall/');
    },
    urlcolrequestsall : function(){
        return this.get(this.host + 'collection_requestsall/');
    },    
    urlrequestsall : function(){
        return this.get(this.host + 'requestsall/');
    },
    urlrequestsall : function(){
        return this.get(this.host + 'requestsall/');
    },
    urlcollectionalldelete: function()
    {
        return this.delete(this.host + 'collectionall/');
    },
    urlcolrequestalldelete: function(itemid)
    {
        return this.delete(this.host + 'collection_requestsall/' + itemid);
    },
    
    get : function(url) {
        url = url;
        return new Promise(function(resolve, reject) {
                $.ajax({
                    url: url,
                    dataType: 'json',
                    type: 'get',
                    contentType: 'application/json',
                    processData: false,
                    success: function( data, textStatus, jQxhr ){
                        resolve(data );
                    },
                    error: function( jqXhr, textStatus, errorThrown ){
                        reject(errorThrown);
                    }
                })
            });

    },
    put : function(url, jsoncontent) {
            url = url;
            return new Promise(function(resolve, reject) {
                $.ajax({
                    url: url,
                    dataType: 'json',
                    type: 'put',
                    contentType: 'application/json',
                    data: JSON.stringify( jsoncontent ),
                    processData: false,
                    success: function( data, textStatus, jQxhr ){
                        resolve(data );
                    },
                    error: function( jqXhr, textStatus, errorThrown ){
                        reject(errorThrown);
                    }
                })
            });

    },
    delete : function(url) {
            url = url;
            return new Promise(function(resolve, reject) {
                $.ajax({
                    url: url,
                    dataType: 'json',
                    type: 'delete',
                    contentType: 'application/json',
                    processData: false,
                    success: function( data, textStatus, jQxhr ){
                        resolve(data );
                    },
                    error: function( jqXhr, textStatus, errorThrown ){
                        reject(errorThrown);
                    }
                })
            });    
    }
};