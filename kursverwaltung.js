
if (Meteor.isClient){
   
   Meteor.startup(function () {
      TAPi18n.setLanguage("de");
      T9n.language = "de";
   
      Accounts.ui.config({
         passwordSignupFields: 'USERNAME_AND_EMAIL'
      });

      AccountsEntry.config({
         homeRoute: '/',                    // mandatory - path to redirect to after sign-out
         dashboardRoute: '/account',      // mandatory - path to redirect to after successful sign-in
         profileRoute: '/account',
         passwordSignupFields: 'USERNAME_AND_EMAIL',
         showSignupCode: false,
         showOtherLoginServices: false      // Set to false to hide oauth login buttons on the signin/signup pages. Useful if you are using something like accounts-meld or want to oauth for api access
      });
   });
}

accountsAdminUiConfiguration = {
  userStatus: true,
  allowImpersonation: false,
  impersonationSuccess: null, //iron-router route for impersonation
  maxUsersPerPage: 25,
  manualSubscriptions: true,
};



