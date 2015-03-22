   Session.setDefault("Adress_id", null );
	

Template.userFormAccount.updateUserAccount = function () {

    //console.log(Session.get("Adress_id"));
  	var data = Adressen.findOne({_id: Session.get("Adress_id")});
    //console.log(data);
    
	return data;
};



Template.Account_Connector.rendered = function() {
        Meteor.typeahead.inject();
       // Meteor.typeahead( this.find('.typeahead'), user_data );
};



Template.Account_Connector.helpers({

   selected: function ( event, suggestion, datasetName ) {

       // set the id from the europa3000 Adresse
       //console.log( suggestion.id);
       Session.set("Adress_id", suggestion.id);
       //console.log(datasetName);
   },
   adressen: function(query, callback) {

     Session.set('searchString', query);
     //console.log(query);

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
  }
});




