
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
      label:"Anmeldungen, welche nicht über Europa 3000 getätigt sind"
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
      defaultValue:"1",
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
   "Belegnummer":{
      type: String,
      label:"Belegnummer"
   },
 "beleg.typ":{
      type: String,
      label:"Beleg Typ",
      allowedValues: ["Rechnung", "Offerte", "Lieferschein", "Gutschein", "Auftragsbestätigung" ]

   },
   "beleg.netto":{
      type: String,
      allowedValues: ["Y", "N"]
   },
   "bookingId":{
      type: String,
      label:"Buchungsnummer"
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
                 {label: "Referat", value: "Referat"},
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

Template.Kurs.helpers({

   anzahlAnmeldungen: function(){
      var a = this.Teilnehmer.Anzahl.Angemeldet;
      var b = 0;
      if (this.rsvps) {     
           var b = this.rsvps.length;
     }
      return (a+b);
  
  },
  isKursleiter: function(){

     var status = false;

     if (this.Coach === Meteor.userId()){
        return status = true;
     }

     var result =  _.each(this.Kursdaten.Daten, function(val, key){
        if(moment(val.date).isSame(new Date(), 'week')){
           if (val.coachName === Meteor.userId()){
              return status = true;
           }
        }
     });

     return status
  }


});





Template.Kurs.events({
   'click button': function (event, template) {

        var data = Cart.findOne()||{};

        if (! jQuery.isEmptyObject(data) ) {
            $('#kursConfirmation').modal('show');
        } else {
            throwError("Welches Angebot möchten sie Wählen? Entscheiden sie sich für einen Preis.");
        } 
   },
   'click .show-teilnehmerkontrolle': function (event, template) {
        event.preventDefault();
console.log(this);
        $('#teilnehmerKontrolle').modal('show');


   }

});

Template.kurs_Preise.events({
    'click input:radio[name=preis]': function (event, template) {
       /* 
        * Radiobox selections is a single value
        * the selected one is added
        * and the old one is removed from Cart collection
        * only one Record is present at the time
        */

       this.inputType = "radio";
       this.Anzahl = 1;
       var record = Cart.findOne({"inputType": "radio"})||{};

       if( jQuery.isEmptyObject(record) ){
          Cart.insert(this);
       }else{
          Cart.remove(record._id);
          Cart.insert(this);
       }
    },
    'click input:checkbox[name=preis_kumulativ]': function (event, template) {
       /* 
        * Checkbox selections are cumulative
        * check is adding a record
        * uncheck is removing a record from Cart collection
        */

       this.inputType = "checkbox";
       this.Anzahl = 1;
       var record = Cart.findOne({"inputType": "checkbox", 
                                "Beschreibung": this.Beschreibung,
                                "Value": this.Value })||{};

       if(jQuery.isEmptyObject(record) ){
          Cart.insert(this);
       }else{
          Cart.remove(record._id);
       }

    }

});


Template.kursLocation.helpers({

   location: function(){
      if (this.Kursort){
      //var data =  Adresse.findOne({_id: this.Coach});
      }

   }


});

Template.kursLeitung.helpers({

   kursleiter: function(){

      if (this.Coach){
         var data =  Meteor.users.findOne({_id: this.Coach});
         //console.log(data.profile.Adresse)
         return data.profile.Adresse
     }
  
      
   }

   
        
}); 

Template.kurseadminbody.events({
    'click td': function (event, template) {
        Router.go('kurs.edit', {_id: this._id});
    }
});






Template.kursConfirmationModal.helpers({

   Cart_data: function(){
       return Cart.find();
   },
   preisTotal: function(){

      var data = Cart.find().fetch();
      var sum = _.reduce(data, function(memo, val){ 
         return memo + (val.Value * val.Anzahl); 
     }, 0);

     return sum;
  }

});


Template.kursConfirmationModal.events({
    'click #purchaseCourse': function (event, template) {

        var data =  Cart.find().fetch();
        var val =  _.map(data, function(value, key){ 
           return {
              "Beschreibung": value.Beschreibung,
              "Value": parseFloat(value.Value),
              "Anzahl": parseInt(value.Anzahl, 10)
           }
        });
        var action = "push";
        var options = {
           rsvp: "yes",
           kursId:  this._id,
           price: EJSON.stringify(val)
        };

        Meteor.call('rsvp', action, options, function (error, result) {

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
    },
   'change input': function (event, template) {
      var anzahl = parseInt( $(event.currentTarget).val(), 10);
      Cart.update({_id: this._id},{$set: {"Anzahl": anzahl}});
  }

});



