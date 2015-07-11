// Collections für einen Kurs
Kurs = new Meteor.Collection("kurse");
// Kurs Sessions
Session.set("createNewCourse", false);

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
   },
   "Konto":{
      type: Number,
      min: 1,
      max: 9999,
      autoform: {
         defaultValue:6001,
         step: "1"
      },
      label:"Buchhaltungs Konto"
   },
   "WGR":{
      type: Number,
      min: 0,
      max: 10000,
      autoform: {
         defaultValue:1,
         step: "1"
      },
      label:"Waren Gruppen Nummer"
   },
   "Steuercode":{
      label:"Steuer Code",
      type: String,
      min: 2,
      max: 2,
      autoform: {
         defaultValue:"00",
      }
   },
   "Steuersatz":{
      type: Number,
      label:"Steuersatz",
      min: 0,
      decimal: true,
      autoform: {
         defaultValue:8,
         step: "0.1"
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
});


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
      type: String,
      optional: true
   }, 
   "Dauer":{
      type: Number,
      decimal: true,
      optional: true
   }, 
   "Daten":{
      type:[Schemas.hatTeilgenommen],
      optional: true
   }  
});


Schemas.TeilnehmerStatistik = new SimpleSchema({
   "Max":{
      type: Number
   }, 
   "Min":{
     type: Number
   },
   "Anzahl.Angemeldet":{
      type: Number,
      optional:true,
      label:"Anmeldungen, welche nicht über Internet getätigt sind"
   }, 
   "Anzahl.Display":{
      type: Boolean,
      optional: true,
      label:"Anzeigen der Anmeldungen",
      autoform: {
      afFieldInput: {
        type: "togglebutton"
       }
     } 
  }  
});  

Schemas.beleg = new SimpleSchema({
 "Debitkonto":{
      type: Number,
      label:"Debitoren Konto",
      allowedValues: [1050],
      autoform: {
         afFieldInput: {
            type: "select"
         }
      }
   },
   "typ":{
      type: String,
      label:"Beleg Typ",
      allowedValues: ["Rechnung", "Offerte", "Lieferschein", "Gutschein", "Auftragsbestätigung" ],
      autoform: {
         afFieldInput: {
            type: "select"
         }
      }
   },
   "netto":{
      type: String,
      label:"Netto oder Brutto Abrechnung",
      allowedValues: ["Y", "N"],
      autoform: {
         afFieldInput: {
            type: "select"
         }
      }
   },
   "zahlungsart":{
      type: String,
      label:"Zahlungsart",
      autoform: {
         type: "select",
         options: function () {
            return [
               {label: "Rechnung", value: "Rechnung"},
               {label: "Visa", value: "Visa"},
               {label: "Mastercard", value: "Mastercard"}
            ];
         }  
      }
   }
});





Schemas.rsvps = new SimpleSchema({
   "date":{
      type: Date,
      label: "Buchungsdatum"
   },
   "price":{
      type:Array,
      optional: true
   },
   "price.$": {
      type: Object
   },
   "price.$.Value":{
      type: Number,
      decimal: true,
      label:"Preis"
   },
   "price.$.Anzahl":{
      type: Number,
      label:"Menge"
   },
   "price.$.Beschreibung":{
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
   "price.$.Konto":{
      type: Number,
      allowedValues: [6000, 6001, 6003, 6004, 6007],
      autoform: {
         afFieldInput: {
            type: "select"
         }
      },
      autoValue: function() {
         if (this.isSet) {
         
         }else{
            return 6003;
         }
      },
      label:"Konto"
   },
   "price.$.WGR":{
      type: Number,
      min: 0,
      autoform: {
         step: "1"
      },
      autoValue: function() {
         if (this.isSet) {
     
         }else{
            return 1;
         }
      },
      label:"Waren Gruppen Nummer"
   },    
   "price.$.Steuercode":{
      label:"Steuer Code",
      type: String,
      min: 2,
      max: 2,
      autoValue: function() {
         if (this.isSet) {

         }else{
            return "00";
         }
      }
   },
   "price.$.Steuersatz":{
      type: Number,
      label:"Steuersatz",
      min: 0,
      decimal: true,
      autoform: {
         step: "0.1"
      },
      autoValue: function() {
         if (this.isSet) {

         }else{
            return 8;
         }
      }
   },
   "bookingId":{
      type: String,
      label:"Buchungsnummer",
      autoValue: function() {
         if (this.isSet) {

         }else{
            return Random.id();
         }
      }
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
   },
   beleg : {
      type: Schemas.beleg
   },
   "beleg.nummer":{
      type: String,
      label:"Beleg Nummer",
      autoValue: function() {
         if (this.isSet) {

         }else{
            return Random.id();
         }
      }

   },
   "beleg.beschreibung":{
      type: String,
      label:"Kommentar zur Rechnung",
      optional: true,
      autoform: {
           afFieldInput: {},
           rows:5
      }
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
      label: "Kurs Titel (max 40 Zeichen)",
      max: 40
   },
   "B2":{
      type: String,
      label: "Zusammenfassung (max 250 Zeichen) ",
      optional: true,
      max: 255
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

Schemas.Kurs = new SimpleSchema({
    Standort: {
        type: String,
        label: "Treffpunkt",
        autoform: {
          rows: 5 
        },
        optional:true
    },  
    Delete: {
        type: String,
        optional:true
    },  
    Activ: {
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
        type: Number,
        label: "Nummer",
        autoform: {
           afFieldInput: {
              defaultValue: function(){
                 var data = Kurse.findOne({},{sort: {"Kursnummer":-1}, fields: {"Kursnummer": 1}});
                 if(data && data.Kursnummer){
                    return parseInt(data.Kursnummer, 10)+1;
                 }  
              }
           }
        }
    },
    Level: {
      type: Array,
      optional: true,
      label: "Geeignet für:",
      autoform: {
         options: [
            {
               label: "Einsteiger",
               value: "Einsteiger"
            }, 
            {
               label: "Aktive",
               value: "Aktive"
            }, 
            {
               label: "Firmen",
               value: "Firmen"
            }, 
            {  
               label: "Kids",
               value: "Kids"
            }, 
         ]  
      }  
    },
    "Level.$": {
      type: String
    },
    Tag: {
      type: Array,
      optional: true,
      label: "Sport Tag",
      autoform: {
         options: [
            {
               label: "Laufen",
               value: "Laufen"
            },
            {
               label: "Schwimmen",
               value: "Schwimmen"
            },
            {
               label: "Kraft",
               value: "Kraft"
            },
            {
               label: "Velo",
               value: "Velo"
            },
            {
               label: "Triathlon",
               value: "Triathlon"
            },

            {
               label: "Mentaltraining",
               value: "Mentaltraining"
            },
            {
               label: "Ernährung",
               value: "Ernährung"
            }

         ]
      }
    },
    "Tag.$": {
      type: String
    },
    Created:{
        type:Date,
        label: "Erstellt am",
        autoform: {
         defaultValue: new Date()
        }
    },
    Art: {
        type: String,
        label: "Art des Angebots",
        autoform: {
           type: "select",
           options: function () {
              return [
                 {label: "Kurs", value: "Kurs"},
                 {label: "Leistungsdiagostik", value: "Leistungsdiagostik"},
                 {label: "Personaltraining", value: "Personaltraining"},
                 {label: "Bikefitting", value: "Bikefitting"},
                 {label: "Camps", value: "Camps"},
                 {label: "Trainingsplanung", value: "Trainingsplanung"}
              ];
           }
       }

    },
    Beschreibung: {
        type: Schemas.KursBeschreibung
    },
    Teilnehmer: {
        type: Schemas.TeilnehmerStatistik
    },
    Annullationsversicherung:{
        type: String,
        label: "Annullationsversicherung(url) ",
        autoform: {
           afFieldInput: {
              type: "url",
              defaultValue:"http://allianz-assistance.onlinetravel.ch/ibe/WWW236/products?language=de&ttsuserid=EPSWWW&ttspswd=WWW236&agency=8049"
           }
        }
    },
    AGB:{
        type: String,
        label: "AGB's(url) ",
        autoform: {
           afFieldInput: {
              type: "url",
              defaultValue:"http://www.my-sport.ch/a/my-sport.ch/home-neu/agb"
           }
        }
    },
    Kursdaten: {
        type: Schemas.Kursdaten,
        label: "Kursdaten"
    },
    KursdatenBeschreibung: {
        type: String,
        optional: true,
                label:"Beschreibung für Leistungsdiagnostik, Presonal Training, Trainingsplanung etc...",
        autoform: {
           afFieldInput: {},
           rows:10
        }
    },
    "Preise": {
        type: [Schemas.Kurspreis],
        optional: true
    },
    "rsvps":{
      type: [Schemas.rsvps],
      optional: true
    },
    "Buchhaltung": {
      type: Object,
      optional: true,
      label: "Default Werte für den Beleg"
    },
    "Buchhaltung.Debitkonto":{
      type: Number,
      label:"Debitoren Konto",
      allowedValues: [1050],
      autoform: {
         afFieldInput: {
            type: "select",
            defaultValue: 1050
         }
      }
   }, 
   "Buchhaltung.typ":{
      type: String,
      label:"Beleg Typ",
      allowedValues: ["Rechnung", "Offerte", "Lieferschein", "Gutschein", "Auftragsbestätigung" ],
      autoform: {
         afFieldInput: {
            type: "select",
            defaultValue: "Rechnung"
         }  
      }  
   },
   "Buchhaltung.netto":{
      type: String,
      label:"Netto oder Brutto Abrechnung",
      allowedValues: ["Y", "N"],
      autoform: {
         afFieldInput: {
            type: "select",
           defaultValue: "N"
         }  
      }  
   }, 
   "Buchhaltung.zahlungsart":{
      type: String,
      label:"Zahlungsart",
      autoform: {
         type: "select",
         defaultValue: "Rechnung",
         options: function () {
            return [
               {label: "Rechnung", value: "Rechnung"},
               {label: "Bar", value: "Bar"},
               {label: "Visa", value: "Visa"},
               {label: "Mastercard", value: "Mastercard"}
            ]; 
         }  
      }  
   },
});


Kurs.attachSchema(Schemas.Kurs);

Template.editkurs.events({

   'click i.create-new-course': function (event, template) {
         Session.set("createNewCourse", true);
         AutoForm.resetForm("editkurs");
   },
   'click button.save-kurs': function (){

      if(AutoForm.validateForm("editkurs")){
         /* Check for Form_error true = no error's */
         //console.log(this);
         clearErrors();

         if(Session.get("createNewCourse")){
          Session.set("createNewCourse", false);
          Router.go('/admin/kurse');

         }else{
            Router.go('kurs.show', {_id: this._id});
         }

      }else{
       clearErrors();
       throwError("es sind nicht alle Felder ausgefüllt, es kann nicht gespeichert werden");

      }
   }


});

Template.editkurs.helpers({
   createNewCourse: function(){
       return Session.get("createNewCourse");
   },
   updateInsert:function(){
      if ( Session.get("createNewCourse")){
         return "insert";
      }else{
         return "update";
      }
   },
   document:function(){

      if ( Session.get("createNewCourse")){
         return null;
      }else{
         return this;
      }

   }
});

























