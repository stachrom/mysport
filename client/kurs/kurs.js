

Template.Kurs.rendered=function() {

   var kurs = this.data || {};
   var anzahlKurse = kurs.Kursdaten.Daten.length || 0;

   $(function () {
      $('[data-toggle="popover"]').popover();
   });
/*
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

*/
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
  },
  


});





Template.Kurs.events({
   'click button.add-shopping-cart': function (event, template) {
        var data = Cart.findOne()||{};
        if (! jQuery.isEmptyObject(data) ) {
            $('#kursConfirmation').modal('show');
        } else {
            throwError("Welches Angebot möchten sie Wählen? Entscheiden sie sich für einen Preis.");
        } 
   },
   'click .show-teilnehmerkontrolle': function (event, template) {
        event.preventDefault();
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


Template.kursLeitung.helpers({

   kursleiter: function(){
        //console.log(this.Coach);
      if (this.Coach){
         var data =  Meteor.users.findOne({_id: this.Coach});
         //console.log(data.profile.Adresse)
         return data.profile.Adresse
      }
 
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
   },
   warteliste: function(){

      if ( this && this.Teilnehmer && this.Teilnehmer.Max){
        var max = this.Teilnehmer.Max;
        var a   = this.Teilnehmer.Anzahl.Angemeldet;
        var b   = 0;
        if (this.rsvps) {
           var b = this.rsvps.length;
        }
        var angemeldet = (a+b);


        if(angemeldet < max){
           return false;
        }else{
           return true;
        }
      }
   } 

});


Template.kursConfirmationModal.events({
    'click #purchaseCourse': function (event, template) {

        var data =  Cart.find().fetch();
        var rsvp = "yes";
        var val =  _.map(data, function(value, key){ 
           console.log(value);
           return {
              "Beschreibung": value.Beschreibung,
              "Value": parseFloat(value.Value),
              "Anzahl": parseInt(value.Anzahl, 10),
              "Konto": parseInt(value.Konto, 10),
              "WGR": parseInt(value.WGR, 10),
              "Steuercode": value.Steuercode,
              "Steuersatz": parseInt(value.Steuersatz, 10)
           }
	});
        var max = this.Teilnehmer.Max;
        var a   = this.Teilnehmer.Anzahl.Angemeldet;
        var b   = 0;
        if (this.rsvps) {
           var b = this.rsvps.length;
        }
        var angemeldet = (a+b);
        var kursdaten = this.Kursdaten.Daten;
    

        if(angemeldet < max){
           rsvp ="yes";
        }else{
           rsvp="warteliste";
        }
  
        var action = "push";
        var options = {
           rsvp: rsvp,
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


Template.teilnehmerKontrolleModal.helpers({
  today: function(){
       return new Date();
   },
   checked:function(){
   //console.log(this);

   }


});


Template.teilnehmerKontrolleModal.events({

   'change [type=checkbox]': function (event, template) {
      console.log(this);
      var checked = $(event.target).is(':checked');  
      var date = $("select[type=date]").val();

      var options = {
           rsvp: "yes",
           kursId: template.data._id,
           timestamp: new Date(date),
           bookingId: this.bookingId
      };
    

      if(checked === true){
         var action = "hatTeilgenommen";
         Meteor.call('rsvp', action, options, function (error, result) {

                if (error === undefined) {
                    //$('#kursConfirmation').modal('hide');
                } else {
                    throwError(error.reason);
                    console.log(error.reason);
                }
         });

      }
      if (checked === false){
         var action = "hatNichtTeilgenommen";
         Meteor.call('rsvp', action, options, function (error, result) {
                if (error === undefined) {
                    //$('#kursConfirmation').modal('hide');
                } else {
                    throwError(error.reason);
                    console.log(error.reason);
                }
         });
      }
   }
});

Template.calenderBoxMonate.helpers({

   monate: function(){
    return  _.uniq(this.Daten, function(val, index){
      return moment(val.date).format("MMMM");
      });
   }
  
});


Template.calenderBoxTage.helpers({

   tage: function(){
  
      if(Template.parentData(1).Daten){
         var monat = this.date;

         return _.filter(Template.parentData(1).Daten, function(val){
            if( moment(val.date).isSame(monat, 'month')){
               return val.date;
            }
         });
      };
   },
   today:function(date){
      var today = new Date();

      if( moment(date).isSame(today, 'day')){
         return "label-info";
      } else if (moment(date).isBefore(today)){
         return "label-default";
      }else{
        return "label-primary";
     }
   } 
   
});
