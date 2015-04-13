
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
      optional: true,
      allowedValues: ["CHF", "BTC", "USD", "EUR"]
   } 
});


Schemas.hatTeilgenommen = new SimpleSchema({
   "date":{
      type: Date
   },
   "coachName":{
      type: String,
      label: "Coach Name",
      optional: true,
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
      label:"hat Teilgenommen am",
      optional: true
   },
   "hatTeilgenommen.$":{
      type: Date
   }
});

Schemas.KursLehrmittel = new SimpleSchema({
   "L1":{
      type: String,
      optional: true
   },
   "L2":{
      type:String,
      optional: true
   }  
});





Schemas.KursBeschreibung = new SimpleSchema({
   "B1":{
      type: String,
      label: "Kurs Titel (B1)"
   },
   "B2":{ 
      type: String,
      label: "Zusammenfassung (B2)",
     optional: true
   },
   "B3":{
      type: String,
      label: "Zusatzinfo (B3)",
      optional: true
   },
   Beschreibung: {
        type: String,
        optional: true,
        label:"Beschreibung Homepage",
        autoform: {
           afFieldInput: {
              type: "contenteditable"
           }
        }
    },
   "Lehrmittel":{
      type: Schemas.KursLehrmittel,
      optional: true
   }
});

Schemas.Kursleiter = new SimpleSchema({
 Adress_id: {
        type: String,
        optional: true,
        label: "Adress Id Europa3000",
        autoform: {
           readonly:true
        },
        autoValue: function(){
          var user_id = this.field("Coach.Kursleiter").value;
          var data = Meteor.users.find({_id: user_id }).fetch();
          return data[0].profile.Admin.Adress_id;
        }
    },
 Kursleiter:{
      type: String,
      label: "Default Coach Name",
      autoform: {
         type: "select",
         options: function () {
           return Roles.getUsersInRole("trainer").map(function (c) {
                    return {label: c.username, value: c._id};
                });
         }
      }
   }
});


Schemas.KursStandort = new SimpleSchema({



});






Schemas.Kurs = new SimpleSchema({
    Adress_id: {
        type: String,
        label: "Adress ID",
        max: 6,
        optional:true
    },
    Coach: {
       type:Schemas.Kursleiter
    },
    Kursnummer: {
        type: String,
        label: "Europa 3000 Kursnummer",
        autoform: {
           disabled:true
        }

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
        type: Schemas.KursBeschreibung,
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




console.log(Schemas.Kurs);




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



