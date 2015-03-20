Errors = new Meteor.Collection(null);

throwError = function(message, code) {
  Errors.insert({message: message, code: code})
}

clearErrors = function() {
  Errors.remove({seen: true});
}

Template.errors.helpers({
  errors: function() {
    return Errors.find();
  }
});


Template.error.rendered = function() {
  var error = this.data;
  Meteor.defer(function() {
    Errors.update(error._id, {$set: {seen: true}});
  });
};



