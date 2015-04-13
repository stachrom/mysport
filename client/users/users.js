
Session.set("user_id", Meteor.userId() );


Template.Users.helpers({
	data: function () {
		var users = Meteor.users.find();    
		//console.log( users.fetch());
		return users;
	}
}); 

Template.Users.events({
        'click button': function (event, template) {
           Session.set("user_id", this._id );
           //Router.go('/account/');
        }
});






