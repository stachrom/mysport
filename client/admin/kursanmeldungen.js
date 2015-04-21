
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
   "change select": function (event, template) {
 
      var rsvp = $(event.currentTarget).val();
      var kursId = this.kurs_id;
      var userId = this.Kunde;

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
