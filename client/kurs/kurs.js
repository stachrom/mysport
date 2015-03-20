Kursleiter = new Meteor.Collection("Kursleiter");




Template.Kurs.events({
    'click button': function (event, template) {

        var price = $('input:radio[name=preis]:checked').val();

	Session.set("chosen_price", price);

        if ( price ) {
            $('#kursConfirmation').modal('show');
        } else {
            throwError("you are kindly requested to chose a Price");
        } 
    }

});

Template.kursLocation.helpers({

   location: function(){
      
      if (this.Adress_id){
        return Locations.findOne({Adress_id: this.Adress_id});
      }

   }


});

Template.kursLeitung.helpers({

   kursleiter: function(){

      if (this.Kurs_Leitung_id){
        return Kursleiter.findOne({Adress_id: this.Kurs_Leitung_id});
      }  
      
   }

   
        
}); 






Template.kursConfirmationModal.helpers({

  preis: function(){
       return Session.get("chosen_price");
         }

});


Template.kursConfirmationModal.events({
    'click #purchaseCourse': function (event, template) {

        var kursId = this._id;
        var rsvp= "yes";
        var price = $('input:radio[name=preis]:checked').val();

        Meteor.call('rsvp', kursId, rsvp, price, function (error, result) {

                if (error === undefined) {

                    $('#kursConfirmation').modal('hide');
                    clearErrors();
                   
                    Meteor.setTimeout(function(){
                        throwError("Die Buchung wurde erfolgreich gespeichert", 201 );                  
                        Router.go('/bookings');
                    }, 300);

		  } else {
                    throwError(error.reason);
                    console.log(error.reason);
                }
        });
    }
});



