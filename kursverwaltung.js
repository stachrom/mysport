
if (Meteor.isClient){
   
   Meteor.startup(function () {
      /* local collections */
      Kursanmeldungen = new Mongo.Collection(null);
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
         showOtherLoginServices: false  
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



