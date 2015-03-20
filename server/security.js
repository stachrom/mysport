// Create a collection where users can only modify documents that
// they own. Ownership is tracked by an 'owner' field on each
// document. All documents must be owned by the user that created
// them and ownership can't be changed. Only a document's owner
// is allowed to delete it, and the 'locked' attribute can be
// set on a document to prevent its accidental deletion.





Meteor.users.allow({
    update: function(userId, doc){
       
    if (Roles.userIsInRole(userId, ['admin'])) {
      return true;
    }else{
       return doc._id === userId;
    }

 //return doc._id === userId; // can update their own profile
    }
});


 _.each([Adressen], function (collection) {
	collection.allow({
	insert: function() {
        	return true;
	},
	update: function(userId, doc, fieldNames, modifier) {
		//console.log(modifier);
		if(modifier.$set.Name && modifier.$set.Vorname){
			var userProfile = {'$set':{
				"profile.Name": modifier.$set.Name,
				"profile.Vorname": modifier.$set.Vorname,
				"profile.LinkedTo": doc._id
			}};
			Meteor.users.update({_id: modifier.$set.IsLinked }, userProfile, {multi: true});
		}
		return true;
	},
	remove: function() {
		return false;
	},
      fetch: []
    });
  });


Kurse.allow({
  insert: function (userId, kurs) {
    return false; // no cowboy inserts -- use createParty method
  },
  update: function (userId, kurs, fields, modifier) {

   for(i=0; kurs.rsvps.length > i; i++){
       if ( kurs.rsvps[i].user === Meteor.userId()){
       //console.log(kurs);
           return true;
       }
   }

    if (userId !== kurs.rsvps.user)
      return false; // not the owner

    var allowed = ["title", "description", "x", "y"];
    if (_.difference(fields, allowed).length)
      return false; // tried to write to forbidden field

    // A good improvement would be to validate the type of the new
    // value of the field (and if a string, the length.) In the
    // future Meteor will have a schema system to makes that easier.
    return true;
  },
  remove: function (userId, kurs) {
    // You can only remove parties that you created and nobody is going to.
    return party.owner === userId && attending(party) === 0;
  }
});
