

// Sessions
Session.setDefault("kurs_table_sort", {Daten: 1} );
Session.setDefault("kurs_id", null );
Session.setDefault("filterTag", "" );
Session.setDefault("filterLevel", "" );

Template.filter.events({

   'change #filterTag':function(event, template){

      var e = event.currentTarget;
      var value = e.options[e.selectedIndex].value;
          Session.set("filterTag", value);

   },
   'change #filterLevel':function(event, template){

      var e = event.currentTarget;
      var value = e.options[e.selectedIndex].value;
          Session.set("filterLevel", value);

   },
   'keypress .search-query' : function (event, template) {

            var searchString =  template.find(".search-query").value + String.fromCharCode(event.which);
            var options = {
                    "searchString": searchString.replace(/(\r\n|\n|\r)/gm,"")
                };
                //console.log("key stroke");
                Session.set('searchString', options.searchString);
   },
   'keyup .search-query' : function (event, template) {
            if (event.which === 8 && Meteor.userId() ) {
                // capter back space button
                 Session.set('searchString', template.find(".search-query").value);

                 //console.log(Session.get('searchString'));
            }
   },






});


Template.tablebody.events({
    'click td': function (event, template) {
        Router.go('kurs.show', {_id: this._id});
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

   tagOptions: function(){
    return Session.get("kurseFilterTag");
   },
   levelOptions: function(){
   // distinct auf Level array methoden aufruf
    return Session.get("kurseFilterLevel");
   },
   selectedTag: function(value){
    return Session.get("filterTag") == value? {selected:'selected'}: '';
   },
   searchString: function(){
    return Session.get("searchString");
   },
   selectedLevel: function(value){
    return Session.get("filterLevel") == value? {selected:'selected'}: '';
   }


})



