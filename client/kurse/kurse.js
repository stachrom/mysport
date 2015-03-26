// Local Collection
Kurse = new Meteor.Collection(null);

// Sessions
Session.setDefault("kurs_table_sort", {Daten: 1} );
Session.setDefault("kurs_id", null );
Session.setDefault("filter", "" );


Meteor.startup(function () {

    Meteor.call('kurseUnwinde', function (error, result) { 
        if (error === undefined) {
                    var count = result.length;
                    for( var i = 0; i < count; i++ ){
                        Kurse.insert(result[i]);
                    }
        } else {
                    console.log(error);
        }
    }); 
});


Template.filter.events({
    'click .btn': function (event, template) {
    	
    	var button = event.currentTarget;
	var value = $(button).find('input:radio').val();
	Session.set("filter", value);
	console.log(value);
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
