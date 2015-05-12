Template.bookings.events({
	
   'click i.remove': function (event, template) {
      
      var action = "pull";
      var id = this._id
      var options = {
           rsvp: "no",
           kursId:  this.kurs_id,
           bookingId: this.bookingId
     };

           Meteor.call('rsvp', action, options, function (error, result) {

                if (error === undefined) {
                    clearErrors();

                    Meteor.setTimeout(function(){
                        throwError("Die Buchung wurde erfolgreich gelöscht", 201 );
                        Router.go('/bookings');
                    }, 300);

                    Kursanmeldungen.remove({_id: id});

                  } else {
                    throwError(error.reason);
                    console.log(error);
                }
        });


  
   },
   'click .kursnummer': function (event, template) {
       
        event.preventDefault();
	Router.go('kurs.show', {_id: this.kurs_id});
   }

});

Template.bookings.helpers({
   remove: function(){
      if (this.Rsvp === "yes" ){
         return true;
      }
   }
});


Template.bookings.rendered=function() {
  $('[data-toggle="tooltip"]').tooltip({'placement': 'bottom'});
};


