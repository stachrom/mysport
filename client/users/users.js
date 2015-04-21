
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






