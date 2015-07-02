

// Sessions
Session.setDefault("kurs_table_sort", {Daten: 1} );
Session.setDefault("kurs_id", null );
Session.setDefault("filter", "" );

Template.filter.events({

   'change #filterSelect':function(event, template){

      var e = event.currentTarget;
      var value = e.options[e.selectedIndex].value;
          Session.set("filter", value);

    }





});


Template.tablebody.events({
    'click td': function (event, template) {
        Router.go('kurs.show', {_id: this.kurs_id});
    }
});



Template.tableheader.events({

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

Template.filter.helpers({

   options: function(){
    return Session.get("kurseFilter");
   },
   selected: function(value){
    return Session.get("filter") == value? {selected:'selected'}: '';
   }




})



