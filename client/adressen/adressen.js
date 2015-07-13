// Collections 
Adressen = new Meteor.Collection("adressen", {
    schema: {
        Firma: {
            type: Boolean
        },
        Anrede: {
            type: String,
            optional: true
        },
        Name: {
            type: String,
            label: "Nachname",
            max: 100
        },
        Vorname: {
            type: String,
            label: "Vorname",
            max: 100
        },
        Strasse: {
            type: String,
            label: "Strasse",
            optional: true,
            max: 100
        },
        Plz: {
            type: Number,
            label: "Postleitzahl",
            min:0,
            max:10000 
        },
        Ortschaft: {
            type: String,
            label: "Ortschaft",
            max: 100
        },
        Zusatz: {
            type: String,
            label: "Zusatz",
            optional: true,
            max: 2000
        },
        Email: {
            type: String,
            label: "Email Adresse",
            regEx: SimpleSchema.RegEx.Email,
            optional: true,
            max: 150
        },
        Homepage: {
            type: String,
            label: "Homepage(URL)",
            regEx: SimpleSchema.RegEx.Url,
            optional: true,            
            max: 150
        },
	Mob: {
            type: String,
            label: "Mobile Nummer",
            optional: false,           
            max: 20
        },
	ZuHandenvon: {
            type: String,
            label: "Zu Handen von",
            optional: true
        },
	Fax: {
            type: String,
            label: "Fax Nummer",
            optional: true,
            max: 20
        },
	Telg: {
            type: String,
            label: "Telefon Geschäft",
            optional: true,
            max: 20
        },
	Telp: {
            type: String,
            label: "Telefon Privat",
            optional: true,
            max: 20
        },
	Postfach: {
            type: Number,
            label: "Postfach",
            optional: true,
            max: 20
        },
	GBDatum: {
            type: Date,
            label: "Geburtstagsdatum",
            optional: true
        },
	IsLinked: {
	    type: String,
	    label: "Deine Daten sind verlinkt mit:",
	    optional: true,
            autoValue:function(){

                if(Session.get("user_id") == "undefined" || Session.get("user_id") == null ){
                    var data = Meteor.userId();
                }else{
                    var data = Session.get("user_id");
                }

                //console.log(data);
                return data;
            } 
        }
    }
});

Tracker.autorun(function () {
    Meteor.subscribe("adressen", Session.get('searchString'), Session.get("Adress_id"));
    Meteor.subscribe('users');
});


Session.setDefault("searchString", null );



Template.Adressen.helpers({
   
  data: function () {
      var adressen = Adressen.find({}); 
      return adressen;  
  },
  searchString: function(){
    return Session.get("searchString");
  }


}); 





Template.Adressen.events({

   'keypress #search-query' : function (event, template) {

            var searchString =  template.find("#search-query").value + String.fromCharCode(event.which);
            var options = {
                    "searchString": searchString.replace(/(\r\n|\n|\r)/gm,""),
                    "userId": Meteor.userId()
                };

            if (Meteor.userId()){
                //console.log("key stroke");
                Session.set('searchString', options.searchString);
            }
   },
   'keyup #search-query' : function (event, template) {
            if (event.which === 8 && Meteor.userId() ) {
                // capter back space button
                 Session.set('searchString', template.find("#search-query").value);

                 //console.log(Session.get('searchString'));
            }
   },

   'click td': function (event, template) {
      //Session.set("adress_id", this.Adress_id );
      //console.log(this._id);
   }

});



