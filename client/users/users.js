
Session.set("user_id", Meteor.userId() );

Template.accountsAdminControlPanel.events({

   'click .edituseraccount':function(){

      Session.set("user_id", this.user._id );
      Router.go('/account/');

   }

});


Template.Users.helpers({
   // check if user is an admin
   isAdminUser: function() {
       return Roles.userIsInRole(Meteor.user(), ['admin']);
   }
});



Template.Users.events({

   'click .download':function(){
      console.log("export all users");
      var collectionname = "users";
      var options = {};

      Meteor.call('downloadExcelFile', collectionname, options, function (error, result) {

                if (error === undefined) {
                    clearErrors();
                    throwError("Alle User sind erfolgreich in Excel exportiert worden", 201 );
                  } else {
                    throwError(error.reason);
                    console.log(error.reason);
                }
        });

      

   }




});


