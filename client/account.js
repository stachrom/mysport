   Session.setDefault("Adress_id", null );
	
   var user_data = function(query, callback){		
     var data = Adressen.find({}, { sort: {Name: -1}, fields:{Name:true, Vorname:true}, limit:10 }).fetch().map( 
        function(it){		
           return {
              value: it.Name,
              id: it._id,
              name: it.Name,
              vorname: it.Vorname
           };
        });
     callback(data);
  };

Template.userFormAccount.updateUserAccount = function () {

    //console.log(Session.get("Adress_id"));
  	var data = Adressen.findOne({_id: Session.get("Adress_id")});
    //console.log(data);
    
	return data;
};



Template.Account_Connector.rendered = function() {
       // Meteor.typeahead.inject();
        Meteor.typeahead( this.find('.typeahead'), user_data );
};



Template.Account_Connector.helpers({

   selected: function ( event, suggestion, datasetName ) {

       // set the id from the europa3000 Adresse
       //console.log( suggestion.id);
       Session.set("Adress_id", suggestion.id);
       //console.log(datasetName);
  }

});


Template.Account_Connector.events({

        'keypress .typeahead': function (event, template) {
        
            var searchString =  template.find(".typeahead").value + String.fromCharCode(event.which);
            var options = {
                    "searchString": searchString.replace(/(\r\n|\n|\r)/gm,""),
                    "userId": Meteor.userId()
                };
                
            if (Meteor.userId()){
                Session.set('searchString', options.searchString);
            }
        },
        'keyup .typeahead' : function (event, template) {
            if (event.which === 8 && Meteor.userId() ) {
                // capter back space button
                 Session.set('searchString', template.find(".typeahead").value);
            }
        }
});
