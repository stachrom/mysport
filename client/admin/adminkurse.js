

Session.set("showAllCourse", false);

Template.kurseadminheader.events({

  'click .sort': function (event, template) {

    var sort = {},
        value = 1,
        $item = $(event.currentTarget);
        $items = $(template.findAll('.sort'));
        // remove classes 
        $items.removeClass('asc desc');

        _.each(Session.get('kurs_table_sort'), function (direction) {
            if (direction === 1){
                value = -1;
                $item.addClass('desc');
            }else{
                value = 1;
                $item.addClass('asc');
            }
        });

        sort[event.currentTarget.getAttribute("data-sort")] = value;
        Session.set('kurs_table_sort', sort );

        //console.log(Session.get('kurs_table_sort'));
  }
});

Template.kurseadminbody.events({
    'click .delete': function (event, template) {
       Session.set("kurs_id", this._id );
       $('#confirmationModal').modal('show');
    },
    'change [type=checkbox].activ-passiv': function (event, template) {
      var checked = $(event.target).is(':checked');
      Kurs.update({_id:this._id},{  $set: {"Activ": checked} });
     
   }

});

Template.adminkurse.events({

   'change [type=checkbox].show-all-course': function (event, template) {
      var checked = $(event.target).is(':checked');

      Session.set("showAllCourse", checked);

   }

});

Template.confirmation.helpers({

   data: function(){ 
      return Kurs.findOne( {_id: Session.get("kurs_id")});
   }


});


Template.confirmation.events({
    
   'click button.confirmation': function (event, template) {

       Kurs.update( {_id: Session.get("kurs_id")}, {$set: {"Delete": true} });
       Session.set("kurs_id", null);
       $('#confirmationModal').modal('hide');

    }

});
