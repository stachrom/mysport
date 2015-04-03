
Schemas = {};







Schemas.Administration = new SimpleSchema({
    Type: {
        allowedValues: [1, 2, 3],        
        label: "Welcher Status hat der Athlet",        
        type: Number,
        optional: true
    },
    LinkedTo: {
        type: String,
        label: "Userdaten sind verlinkt mit:",
        autoform: {
           type: 'typeahead', 
           options: {},
           typeaheadOptions: {
                 minLength: 3
           }
        },
        optional: true
    },
    Zusatz: {
        type: String,
        label: "Notizen",
        optional: true,
        max: 2000,
        autoform: {
           rows: 10
        }
    }
});







Schemas.Communication = new SimpleSchema({
    "Telg": {
        type: String,
        label: "Telefon Geschäft",
        regEx: /^[0-9 +()]{10,30}$/,
        optional: true
    },
    "Telp": {
        type: String,
        label: "Telefon Privat",
        regEx: /^[0-9 +()]{10,30}$/,
        optional: true
    },
    "Telm": {
        type: String,
        label: "Telefon Mobile",
        regEx: /^[0-9 +()]{10,30}$/,
        optional: true
    },
    Fax: {
        type: String,
        label: "Fax Nummer",
        optional: true,
        max: 20
    },
    Webseite: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true
    }
});



Schemas.UserAdresse = new SimpleSchema({
   Anrede: {
        type: String,
        label: "Anrede",
        regEx: /^[a-zA-Z-]{2,25}$/,
        optional: true
    },
    ZuHandenVon:{type: String,
        label: "Zu Handen von",
        regEx: /^[a-z0-9A-z .]{3,30}$/,
        optional: true
    },
    Name: {
        type: String,
        label: "Name",
        regEx: /^[a-zA-Z-]{2,25}$/,
        optional: false
    },
    Vorname: {
        type: String,
        label: "Vorname",
        regEx: /^[a-zA-Z]{2,25}$/,
        optional: false
    },
    Strasse : {
        type: String,
        label: "Strasse",
        regEx: /^[a-z0-9A-z .]{3,30}$/,
        optional: true
    },
    Ortschaft: {
        type: String,
        label: "Ortschaft",
        regEx: /^[a-zA-Z-]{2,25}$/,
        optional: true
    },
    PLZ: {
        type: Number,
        label: "Postleitzahl",
        optional: true
    }
});


Schemas.UserProfile = new SimpleSchema({
    Adresse: {
        type: Schemas.UserAdresse,
        label: "Postanschrift",
        optional: true
    },
    Kommunikation: {
        type: Schemas.Communication,
        label: "Kommunikation",
        optional: true
    },
    GBDatum: {
        type: Date,
        label: "Geburtstagsdatum",
        optional: true
    },
    Admin: {
            type: Schemas.Administration,
            label: "My-Sport Administation",
            optional: true
    }
});
 


Schemas.User = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    username: {
        type: String,
        regEx: /^[a-z0-9A-Z_]{3,15}$/
    },
    emails: {
        type: [Object],
        // this must be optional if you also use other login services like facebook,
        // but if you use only accounts-password, then it can be required
        optional: true
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Schemas.UserProfile,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Note that when using this package, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: Object,
        optional: true,
        blackbox: true
    }
});


Meteor.users.attachSchema(Schemas.User);

Template.FormUserAccount.helpers({

   typeaheadDatasets: function() {

      var data = Adressen.find({}, { sort: {Name: -1}, fields:{Name:true, Vorname:true}, limit:10 }).fetch().map(
        function(it){
           return {
              value: it._id,
              label: it.Name
           };
        });

      console.log(data);

      return data;

   }
});

Template.FormUserAccount.rendered = function () {

   $('input[name="profile.Admin.LinkedTo"]').on('keypress', function (event, data) {
     
   
      var options = {
         "searchString": $(this).val(),
         "userId": Meteor.userId()
      };

      if (Meteor.userId()){
         Session.set('searchString', options.searchString);
      }

   });


   $('input[name="profile.Admin.LinkedTo"]').on('keyup', function (event, data) {
                 

      if (event.which === 8 && Meteor.userId() ) {
         Session.set('searchString', $(this).val());
      }


   });



}



Template.FormUserAccount.helpers({
   users: function () {
      return Meteor.users;
   },
   userSchema: function () {
      return Schema.User;
   },
   editingDoc: function editingDocHelper() {
     

      //console.log("User_id "+Session.get("user_id"));
      //console.log("Adress_id "+Session.get("Adress_id"));

      if(Session.get("user_id") == "undefined" || Session.get("user_id") == null ){
                    var data = Meteor.userId();
      }else{
                    var data = Session.get("user_id");
      }
      //console.log("data "+ data);

      var user = Meteor.users.find( {_id: data }).fetch();

      if(Session.get("Asress_id") == "undefined" || Session.get("Adress_id") == null ){
         return user[0];
      }else{            
         $("input[name='profile.Admin.LinkedTo']").val( Session.get("Adress_id"));
         Session.set("Adress_id", null);
     }

         return user[0];

   }

});

