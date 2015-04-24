
Meteor.startup(function () {

   Session.setJSON("filter_kursanmeldung", null);
   Session.set("kursanmeldungen_select_options", {"options": [
                       {value:"fakturiert", key:"fakturiert"},
                       {value:"warteliste", key:"warteliste"},
                       {value:"exported", key:"exported"},
                       {value:"yes", key:"yes"},
                       {value:"no", key:"no"} 
                   ] });
});

Template.anmeldungsfilter.rendered=function() {
 
   $('#datepicker').datepicker({
      minViewMode: 1,
      language: "de",
      endDate: "today",
      defaultViewDate: { month: 04 }
   });

   $("#datepicker").on("changeDate", function(event) {
     
     var date = $("#datepicker").datepicker('getFormattedDate');

     if(date){
        Session.setJSON("filter_kursanmeldung.date", new Date(date));
     }else{
        Session.setJSON("filter_kursanmeldung.date", null);
     }
  
   });

}

Template.anmeldungsfilter.events({
   
   "change #anmeldungszustand": function (event, template) {
    
      var data = $( "#anmeldungszustand" ).val();
      Session.setJSON("filter_kursanmeldung.rsvp", data);
  },
  "click .clearfilter": function (event, template) {
      Session.setJSON("filter_kursanmeldung", null);
      $('#datepicker').datepicker('update', '');
      $('#typeahead_user').val("");
      $('#typeahead_kurse').val("");    
      $('select').prop('selectedIndex',0);

  }

});


Template.typeahead_user.rendered = function () {
   Meteor.typeahead.inject();
};

Template.typeahead_kurse.rendered = function () {
   Meteor.typeahead.inject();
};


Template.kursanmeldungen_select_options.helpers({

   data :function(){
    var data = Session.get("kursanmeldungen_select_options");
      //console.log(data);
      var rsvp = this.rsvp;
      var daten = _.map(data.options, function(value, key){
        // extend the dropdown value with selected information
        if(value.value === rsvp){
           return {value: value.value, key:value.key, "selected":true}
        }else{
           return value
        }
       });
      return  daten;
   }

});


Template.anmeldungen.events({
		"change": function (event, template) {


		var rsvp         = $(event.currentTarget.offsetParent).find('select').val();
		var gueltigt_bis = new Date( $(event.currentTarget.offsetParent).find('input[type=date]').val() );
		var anzahl       = parseInt( $(event.currentTarget.offsetParent).find('input[type=number]').val(), 10);

		Kursanmeldungen.update({_id: this._id},{$set:{"changed": true, 
                                                              "Rsvp": rsvp, 
                                                              "BerechtigtZurTeilnahme": anzahl, 
                                                              "BerechtigtZurTeilnahmeBis": gueltigt_bis  
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

   }


});

Template.row_action_primary.events({
   'click button': function (event, template) {

       var data = this.data;

       var kursId =  data.kurs_id;
       var rsvp   =  data.Rsvp;
       var userId =  data.Kunde;
       var anzahlTeilnahmen =  data.BerechtigtZurTeilnahme; 
       var timestamp = data.BerechtigtZurTeilnahmeBis.getTime();

       console.log(timestamp);

           Meteor.call('fakturieren', kursId, rsvp, userId, anzahlTeilnahmen, timestamp, function (error, result) {
                if (error === undefined) {
                    clearErrors();
                    Kursanmeldungen.update({_id: data._id},{$unset:{"changed":""}});
                } else {
                    throwError(error.reason);
                    console.log(error.reason);
                }
      });




   }
});


Template.typeahead_user.helpers({

   selected: function ( event, suggestion, datasetName ) {
       Session.setJSON("filter_kursanmeldung.user.id", suggestion.id);
       // console.log(Session.getJSON("filter_kursanmeldung"));
   },

   meteoruser: function( query, callback) {
   var where = {'username': {$regex:query,$options:'i'}};
   //console.log(query);

   var data = Meteor.users.find(where, { sort: {username: -1}, limit:10 }).fetch().map(
      function(it){
         var name = "";
         var vorname = "";           

         if(   it.profile.Adresse 
            && it.profile.Adresse.Name 
            && it.profile.Adresse.Vorname){
 
            name = it.profile.Adresse.Name;
            vorname = it.profile.Adresse.Vorname;
         }


         return {
              value: it.username,
              id: it._id,
              name: name,
              vorname: vorname
         };
      });

     callback(data);
   }
});


Template.typeahead_kurse.helpers({

   selected: function ( event, suggestion, datasetName ) {
       Session.setJSON("filter_kursanmeldung.kurs.id", suggestion.id);
   },

   kurse: function( query, callback) {
   var where = {'Beschreibung.B1': {$regex:query,$options:'i'}};
   var data = Kurs.find(where, { sort: {"Kursnummer": -1}, limit:10 }).fetch().map(
      function(it){

         var Beschreibung = "";
       
         if(it.Beschreibung && it.Beschreibung.B1){
            Beschreibung = it.Beschreibung.B1;
         }

         return {
              value: Beschreibung,
              id: it._id,
              kursnummer: it.Kursnummer
         };
      });

     callback(data);
   }
});
