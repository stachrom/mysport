
// Collections für eine Kurs
Kursleiter = new Meteor.Collection("Kursleiter");
Locations = new Meteor.Collection("Location");
Kurs = new Meteor.Collection("kurse");

Schemas = Schemas || {};

Schemas.Kurspreis = new SimpleSchema({
   "Value":{
      type: Number
   },
   "Beschreibung":{
      type: String,
      max: 255
   },
   "Currency":{
      type: String,
      allowedValues: ["CHF", "BTC", "USD", "EUR"]
   }, 
});


Schemas.hatTeilgenommen = new SimpleSchema({
   "date":{
      type: Date
   },
   "coachName":{
      type: String,
      label: "Coach Name",
      autoform: {
         type: "select",
         options: function () {
           return Roles.getUsersInRole("trainer").map(function (c) {
                    return {label: c.username, value: c._id};
                });
         }
      }
   }
})


Schemas.Kursdaten = new SimpleSchema({
   "Start":{
      type: Date
   },
   "Stop":{
      type: Date
   },
   "Uhrzeit":{
      type: String
   },
   "Dauer":{
      type: Number,
      decimal: true
   },
   "Daten":{
      type:[Schemas.hatTeilgenommen],
      optional: true
   }
});


Schemas.rsvps = new SimpleSchema({
   "date":{
      type: Date,
      label: "Buchungsdatum"
   },
   "price":{
      type: Number,
      label:"Preis"
   },
   "rsvp":{
      type: String,
      label:"Zustand der Anmeldung",
      allowedValues: ["fakturiert", "exported", "yes", "no", "warteliste"]
   },
   "user":{
      type: String,
      label:"User id"
   },
   "username":{
      type: String,
      label:"User Name"
   },
   "Beschreibung":{
      type: String,
      label:"Beschreibung"
   },
   "berechtigtZurTeilnahme":{
      type: Number,
      label:"Anzahl der Teilnahmen"
   },
   "berechtigtZurTeilnahmeBis":{
      type: Date,
      label:"Enddatum der bezahlten Periode"
   },
   "hatTeilgenommen":{
      type: [Date],
      label:"hat Teilgenommen am"
   },
   "hatTeilgenommen.$":{
      type: Date
   }
});


Schemas.Kurs = new SimpleSchema({
    Adress_id: {
        type: String,
        label: "Adress ID",
        max: 6
    },
    Kursnummer: {
        type: String,
        label: "Kursnummer"
    },
    Created:{
        type:Date
    },
    Art: {
        type: String,
        label: "Art des Kurses",
        allowedValues: ["Kurs", "Training"]
    },
    Beschreibung: {
        type: String,
        optional: true,
        autoform: {
           afFieldInput: {
              type: "contenteditable"
           }
        }
    },
    lastCheckedOut: {
        type: Date,
        label: "Last date this book was checked out",
        optional: true
    },
    Kursdaten: {
        type: Schemas.Kursdaten,
        label: "Kursdaten"
    },
    "Preise": {
        type: [Schemas.Kurspreis],
        optional: true
    },
   "rsvps":{
     type: [Schemas.rsvps],
     optional: true,
     minCount: 0,
     maxCount: 20
   }

});


Kurs.attachSchema(Schemas.Kurs);









Template.Kurs.AnzahlKurse = function () {
      return Template[this.postName];
   };


Template.Kurs.rendered=function() {

   var kurs = this.data || {};
   var anzahlKurse = kurs.Kursdaten.Daten.length || 0;

   $('#calendar_embeded').datepicker({
      todayHighlight: true,
      todayBtn: true,
      language: "de",
      beforeShowDay: function (date){

         for(var i = 0; i < anzahlKurse; i++){

            if (   (date.getMonth() == (new Date(kurs.Kursdaten.Daten[i].date)).getMonth())
                && (date.getYear()  == (new Date(kurs.Kursdaten.Daten[i].date)).getYear())
                && (date.getDate()  == (new Date(kurs.Kursdaten.Daten[i].date)).getDate())){

                // console.log(kurs);

                return {
                   tooltip: kurs.Beschreibung.B1 +" - "+ moment(new Date(kurs.Kursdaten.Daten[i].date)).format("dddd,D.MMMM YYYY, hh:mm")+" Uhr",
                   classes: 'active'
                   };
                }
            }
            return false; // not selectable 
        }
   });
   }


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

Template.kurseadminbody.events({
    'click td': function (event, template) {
        Router.go('kurs.edit', {_id: this._id});
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



