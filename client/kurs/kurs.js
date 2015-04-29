
// Collections für eine Kurs
Kurs = new Meteor.Collection("kurse");

AutoForm.addInputType('togglebutton', {
  template: 'afTogglebutton',
  valueOut: function () {
    return !!this.is(":checked");
  },
  valueConverters: {
    "string": function (val) {
      if (val === true) {
        return "TRUE";
      } else if (val === false) {
        return "FALSE";
      }
      return val;
    },
    "stringArray": function (val) {
      if (val === true) {
        return ["TRUE"];
      } else if (val === false) {
        return ["FALSE"];
      }
      return val;
    },
    "number": function (val) {
      if (val === true) {
        return 1;
      } else if (val === false) {
        return 0;
      }
      return val;
    },
    "numberArray": function (val) {
      if (val === true) {
        return [1];
      } else if (val === false) {
        return [0];
      }
      return val;
    }
  },
  contextAdjust: function (context) {
    if (context.value === true) {
       context.atts.checked = "";     
    }
    //don't add required attribute to checkboxes because some browsers assume that to mean that it must be checked, which is not what we mean by "required"
    delete context.atts.required;
    return context;
  }
});



Schemas = Schemas || {};

Schemas.Kurspreis = new SimpleSchema({
   "Value":{
      type: Number
   },
   "Beschreibung":{
      type: String,
      max: 255
   },
   'Menge': {
    type: Boolean,
    optional: true,
    label:"Auswahl für Mengenanbage anzeigen?",
    autoform: {
      afFieldInput: {
        type: "togglebutton"
       }
     }
   },
   "Currency":{
      type: String,
      optional: true,
      allowedValues: ["CHF", "BTC", "USD", "EUR"]
   },
   'Kumulativ': {
    type: Boolean,
    optional: true,
    label:"",
    autoform: {
      afFieldInput: {
        type: "togglebutton"
       }
     }
   }
});


Schemas.hatTeilgenommen = new SimpleSchema({
   "date":{
      type: Date,
      autoform: {
        afFieldInput: {
           type: "datetime-local"
        }
     }
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
      type: Date,
      autoform: {
         afFieldInput: {
            type: "datetime-local"
         }
      }
   },
   "Stop":{
     type: Date,
     autoform: {
        afFieldInput: {
           type: "datetime-local"
        }
     }
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
       type:Object
   },
   "price.value":{
      type: Number,
      decimal: true,
      label:"Preis"
   },
   "price.anzahl":{
      type: Number,
      defaultValue:"1",
      label:"Menge"
   },
   "price.Beschreibung":{
      type: String,
      label:"Beschreibung"
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
      label: "Kurs Titel"
   },
   "B2":{ 
      type: String,
      label: "Zusammenfassung",
      optional: true
   },
   "B3":{
      type: String,
      label: "Zusatzinfo",
      optional: true
   },
   Beschreibung: {
        type: String,
        optional: true,
        label:"Beschreibung Homepage",
        autoform: {
           afFieldInput: {},
           rows:10
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
    Active: {
       type: Boolean,
       optional: true,
       autoform: {
          type: "togglebutton"
       },
       label: "Soll das Angebot angezeigt werden?"
    },
    Coach:{
      type: String,
      label: "Kursleiter",
      autoform: {
         type: "select",
         options: function () {
           return Roles.getUsersInRole("trainer").map(function (c) {
                    return {label: c.username, value: c._id};
                }); 
         }      
      }  
    }, 
    Kursnummer: {
        type: String,
        label: "Kursnummer",
        index: true,
        unique: true

    },
    Created:{
        type:Date,
        label: "Erstellt am: "
    },
    Art: {
        type: String,
        label: "Art des Kurses",
        autoform: {
           type: "select",
           options: function () {
              return [
                 {label: "Kurs", value: "Kurs"},
                 {label: "Training", value: "Training"},
                 {label: "Leistungsdiagostik", value: "Leistungsdiagostik"},
                 {label: "Trainingsplanung", value: "Trainingsplanung"}
              ];
           }
       }
 
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




// console.log(Schemas.Kurs);




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

Template.kurs_Preise.events({
    'click input:radio[name=preis]': function (event, template) {
        console.log(this);

    },
    'click input:checkbox[name=preis_kumulativ]': function (event, template) {
       
       if($('input:checkbox[name=preis_kumulativ]:checked').val() ){
          console.log("yeeee we are checked");
       }else{
           console.log("nope... we are not");
       }
   

    }

});


Template.kursLocation.helpers({

   location: function(){
      
      if (this.Adress_id){
       // return Locations.findOne({Adress_id: this.Adress_id});
      }

   }


});

Template.kursLeitung.helpers({

   kursleiter: function(){

      if (this.Kurs_Leitung_id){
        //return Kursleiter.findOne({Adress_id: this.Kurs_Leitung_id});
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



