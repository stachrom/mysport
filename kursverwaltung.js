
if (Meteor.isClient){
   
   Meteor.startup(function () {
      /* local collections */
      Kursanmeldungen = new Mongo.Collection(null);
      Kurse = new Meteor.Collection(null);

      /* fill up the Kurse collection */
      Meteor.call('kurseUnwinde', function (error, result) {
              if (error === undefined) {
                    var count = result.kurse.length; 
                    for( var i = 0; i < count; i++ ){
                        Kurse.insert(result.kurse[i]);
                    }

                    Session.set("kurseFilter", result.filter);

              } else {
               
              }
      });



      /* Einkaufswagen --> Cart */
      Cart = new Mongo.Collection(null);

      TAPi18n.setLanguage("de");
      T9n.language = "de";
   
      Accounts.ui.config({
         passwordSignupFields: 'USERNAME_AND_EMAIL'
      });

      AccountsEntry.config({
         /* mandatory - path to redirect to after sign-out */
         homeRoute: '/',              
         /*  mandatory - path to redirect to after successful sign-in */
         dashboardRoute: '/account', 
         profileRoute: '/account',
         passwordSignupFields: 'USERNAME_AND_EMAIL',
         showSignupCode: false,
         /* 
          * Set to false to hide oauth login buttons on the signin/signup pages. 
          * Useful if you are using something 
          * like accounts-meld or want to oauth for api access
          */
         showOtherLoginServices: true  
      });
   });
}

accountsAdminUiConfiguration = {
  userStatus: true,
  allowImpersonation: false,
  /* iron-router route for impersonation */
  impersonationSuccess: null,
  maxUsersPerPage: 25,
  manualSubscriptions: true,
};



