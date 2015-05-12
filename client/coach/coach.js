


Template.kurseCoach.events({
   'click .list-group-item': function (event, template) {
   console.log(this);
         event.preventDefault();
         Router.go('kurs.show', {_id: this._id});
   }
   });





