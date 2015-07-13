
Session.setDefault("Adress_id", null );
Schemas = {};

AutoForm.addInputType('typeahead', {
  template: 'quickForm_typeahead'
});

Schemas.Administration = new SimpleSchema({
    Type: {
        allowedValues: [1, 2, 3],        
        label: "Athletenstatus",        
        type: Number,
        optional: true
    },
    verlinkung:{
       type: String,
       label: "Verlinkt mit",
       optional: true,
       autoform: {
          type: "typeahead"
       }
    },   
    LinkedTo:{
       type: String,
       label: "user Id",
       optional: true,
       autoform: {
          readonly: true
       }
    },
    Adress_id:{
       type: String,
       optional: true,
       label: "Europa3000 Adress Id",
       autoform: {
          readonly: true
       }
    },
    'export':{
       type: Boolean,
       label: "export to Europa 3000",
       autoform: {
          afFieldInput: {
             type: "togglebutton"
          }
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
    },
    "Email": {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
        optional: true
    },
});



Schemas.UserAdresse = new SimpleSchema({
   Anrede: {
        type: String,
        label: "Anrede",
        regEx: /^[A-Za-z\u00C0-\u017F-]{2,25}$/,
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
        regEx: /^[A-Za-z\u00C0-\u017F-]{2,25}$/,
        optional: false
    },
    Vorname: {
        type: String,
        label: "Vorname",
        regEx: /^[A-Za-z\u00C0-\u017F]{2,25}$/,
        optional: false
    },
    Strasse : {
        type: String,
        label: "Strasse",
        regEx: /^[A-Z0-9a-z\u00C0-\u017F .]{3,30}$/,
        optional: true
    },
    Ortschaft: {
        type: String,
        label: "Ortschaft",
        regEx: /^[A-Za-z\u00C0-\u017F]{2,25}$/,
        optional: true
    },
    PLZ: {
        type: Number,
        label: "Postleitzahl",
        optional: true
    }
});


Schemas.Notizen = new SimpleSchema({
    "Notiz": {
        type: String,
        autoform: {
           label:false,
           afFieldInput: {
              type: "textarea"
           }
        }
    },
    "user_id": {
        type: String,
        optional:true,
        autoform:{
	   type: "hidden",
           label: false
	},
        autoValue:function(){
           if(this.isSet === false){
              return Meteor.userId();
           }        
        }

    },
    "createdAt": {
        type: Date,
        optional:true,
        autoform:{
           type: "hidden",
           label: false
        },
        autoValue:function(){
           if(this.isSet === false){
              return new Date;
           }else{
              this.unset();
           }
        }
    
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
    Admin: {
            type: Schemas.Administration,
            label: "My-Sport Administation",
            optional: true
    },
    Comment: {
            type: [Schemas.Notizen],       
            optional: true
    },
    GBDatum: {
        type: Date,
        label: "Geburtstagsdatum",
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

Template.quickForm_typeahead.helpers({


   selected: function ( event, suggestion, datasetName ) {

       // set the id from the europa3000 Adresse
       //console.log( suggestion.adress_id);
       Session.set("Europa3000",{adresse: {id:suggestion.adress_id}});
       Session.set("Adress_id", suggestion.id);

          var data = Adressen.findOne(suggestion.id);
    
           if (data !== undefined ){
             
              $("input[name='profile.Adresse.Anrede']").val(data.Anrede);
              $("input[name='profile.Adresse.ZuHandenVon']").val(data.ZuHandenVon);
              $("input[name='profile.Adresse.Name']").val(data.Name);
              $("input[name='profile.Adresse.Vorname']").val(data.Vorname);
              $("input[name='profile.Adresse.Strasse']").val(data.Strasse);
              $("input[name='profile.Adresse.Ortschaft']").val(data.Ortschaft);
              $("input[name='profile.Adresse.PLZ']").val(data.Plz);
              $("input[name='profile.Kommunikation.Telp']").val(data.Telp);
              $("input[name='profile.Kommunikation.Telg']").val(data.Telg);
              $("input[name='profile.Kommunikation.Telm']").val(data.Telm);
              $("input[name='profile.Kommunikation.Fax']").val(data.Fax);
              $("input[name='profile.GBDatum']").val(data.GBDatum);

           }

       //console.log(suggestion);
   },

   adressen: function( query, callback) {
     Session.set('searchString', query);

     var data = Adressen.find({}, { sort: {Name: -1}, fields:{Name:true, Vorname:true, Adress_id:true}, limit:10 }).fetch().map(
        function(it){     
           return {
              value: it.Name,
              id: it._id,
              adress_id: it.Adress_id,
              name: it.Name,
              vorname: it.Vorname
           };
        });

     callback(data);
   }
});




Template.quickForm_typeahead.rendered = function () {

   Meteor.typeahead.inject();

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
         var europa3000 = Session.get("Europa3000");

         $("input[name='profile.Admin.LinkedTo']").val( Session.get("Adress_id"));
         $("input[name='profile.Admin.Adress_id']").val( europa3000.adresse.id);
         
         Session.set("Adress_id", null);
         Session.set("Europa3000", null);
     }

         return user[0];

   }

});

