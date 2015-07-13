Rechnung = new Mongo.Collection(null);


Template.new_booking.rendered = function() {
   // $('a.link').tooltip() //initialize all tooltips in this template
};


Template.rechnung.helpers({

   hasData: function(){
      if (Rechnung.findOne()){
         var data = Rechnung.findOne();
         _.extend(data, {Beleg_id: Random.id()});
         return data;
      }
   },
   showWell: function(){
      if (Rechnung.findOne()){
        return "well";
      }
   }
});

Template.rechnung.events({

   'click button.buchungen': function (event, template) {
       var belegId = template.find("#Beleg-id").value;
       var kommentar = template.find("#textArea").value;  
       var zahlungsart = $("#selectZahlungsart option:selected").text();

       var buchungen = Rechnung.find({}).fetch();
       var action ="export";
       var userId = buchungen[0].Kunde;

       _.each(buchungen, function(value){
        
          var options = {
            kursId: value.kurs_id,
            bookingId:value.bookingId,
            rsvp: "readyforexport",
            belegId: belegId,
            kommentar: kommentar, 
            zahlungsart: zahlungsart
         };
         // status update für alle buchungen! 
         Meteor.call('rsvp', action, options, function (error, result) {
                if (error === undefined) {

                    clearErrors();
                    Rechnung.remove(value._id);
                    Kursanmeldungen.remove({"bookingId" : value.bookingId});

                    if (Rechnung.find().count() === 0 ){ 
                       Meteor.call('xmlExportKursAnmeldungen', userId, belegId, function (error, result) {
                          if (error === undefined) {
                             clearErrors();
                          } else {
                             throwError(error.reason);
                             console.log(error);
                          }

                       });
                    }
                } else {
                    throwError(error.reason);
                    console.log(error);
                }
         });

       });

     
   
   }

});





Template.new_user.helpers({
  
   data: function () {
      var readyToLink = Meteor.users.find({ 'profile.Admin.LinkedTo': { $exists: false } }); 
      
      return {
              readyToLink : readyToLink,
              count : readyToLink.fetch().length,
              TotalUserCount : Meteor.users.find().fetch().length
             };
   }
  
});

Template.new_user.events({

   'click .actionUserVerlinken': function (event, template) {
      Session.set("user_id", this._id );
      //console.log(this);
   }

});


Template.exported.events({

   'click input[type=checkbox]': function (event, template) {
   
         var anzahl = parseInt( $(event.currentTarget.offsetParent).find('input[type=number]').val(), 10);
         var timestamp = new Date( $(event.currentTarget.offsetParent).find('input[type=date]').val() );
         var kursId = this.kurs_id;
         var rsvp= "fakturiert";
         var userId = this.Kunde;
         var bookingId = this.bookingId;
         var checked = $(event.target).is(':checked');

         if( ! moment(timestamp).isValid())
            return throwError("Geben sie ein End-Datum an");

         if((Match.test(anzahl, Match.Integer)) && (anzahl >= 1) ){

         }else{
            return throwError("Geben sie eine Zahl an, welche grösser 1 ist");
         }

         if (checked){  
            var rsvp= "fakturiert";
         }else{
            var rsvp= "exported";
         }
 
         var action ="set";
         var options = {
            kursId: kursId,
            bookingId: bookingId,
            rsvp: rsvp,
            anzahlTeilnahmen: anzahl,
            timestamp: timestamp
         }
         
         console.log(options);

         Meteor.call('rsvp', action, options, function (error, result) {
                if (error === undefined) {
                    clearErrors();
                } else {
                    throwError(error.reason);
                    console.log(error);
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
   'click button.refresh': function (event, template) {
      
      var options ={"rsvp" : "exported"};

      Meteor.call('anmeldungenUnwind', options, function(error, result) {

              // before we populate locale collection lets clean it!
              Kursanmeldungen.remove({"Rsvp" : "exported"});

              if(error === undefined){
                 if(result.buchungen){
                    _.each(result.buchungen, function(value, index){
                        Kursanmeldungen.insert(value);
                    });
                 }
              }

           });
   }
});

Template.new_booking.events({

   'click .list-group-item': function (event, template) {
       var element = $(event.currentTarget);
       //console.log(this);
       if(element.hasClass("well")){
          Rechnung.remove(this._id);
          element.removeClass("well");
       }else{
          Rechnung.insert(this);
          element.addClass("well");
       }
   },
   'click button.refresh': function (event, template) {
      
      var options ={"rsvp" : "yes"};

      Meteor.call('anmeldungenUnwind', options, function(error, result) {

              // before we populate locale collection lets clean it!
              Kursanmeldungen.remove({"Rsvp" : "yes"});
              Rechnung.remove({});

              if(error === undefined){
                 if(result.buchungen){
                    _.each(result.buchungen, function(value, index){
                        Kursanmeldungen.insert(value);
                    });
                 }
              }

      });
   }



});
      
