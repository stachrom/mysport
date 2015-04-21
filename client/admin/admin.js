
Template.new_booking.rendered = function() {
   // $('a.link').tooltip() //initialize all tooltips in this template
};

Template.new_user.helpers({
  data: function () {

      var readyToLink = Meteor.users.find({ 'profile.Admin.LinkedTo': { $exists: false } }); 
      
      return {
              readyToLink : readyToLink,
              count : readyToLink.fetch().length,
              TotalUserCount : Meteor.users.find().fetch().length
             };
  },
  
});

Template.new_user.events({

 'click .actionUserVerlinken': function (event, template) {

      Session.set("user_id", this._id );
      //console.log(this);

   },




});





Template.new_booking.events({

   'click input[type=checkbox]': function (event, template) {

        var kursId = this.kurs_id;
        var rsvp= "fakturiert";
        var userId = this.Kunde;

         if ($(event.target).hasClass("checked")){

            $(event.target).removeClass( "checked" );
            var rsvp= "exported";

         }else{

            $(event.target).addClass( "checked" );
            var rsvp= "fakturiert";
         }
 

         Meteor.call('fakturieren', kursId, rsvp, userId, function (error, result) {
                if (error === undefined) {
                    clearErrors();
                } else {
                    throwError(error.reason);
                    console.log(error.reason);
                }
         });
   },
   'click a.userid': function (event, template) {
         
         event.preventDefault();
         Session.set("user_id", this.Kunde );
         Router.go('/account/');


   },
   'click a.kursnummer': function (event, template) {
         
         event.preventDefault();
         Router.go('kurs.show', {_id: this.kurs_id});

   },
   'click button.faktura': function (event, template) {
           var options = {};
           var user = {};

      Meteor.call('anmeldungenUnwind', user, options, function(error, result) {

              if(error === undefined){
                 Session.set("new_bookings", result)
              }

           });
      

   },



});

