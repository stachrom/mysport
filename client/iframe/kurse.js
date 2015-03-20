// Collections 
Kurs = new Meteor.Collection("kurse");
Locations = new Meteor.Collection("Location");

// Sessions
Session.setDefault("kurs_table_sort_iframe", {Daten: 1} );

Template.tableBodyIframe.helpers({

   location: function(){
       if (this.Adress_id){
        return Locations.findOne({Adress_id: this.Adress_id});
      }
   }

})

Template.tableBodyIframe.events({
    'click td': function (event, template) {
    // open the frame links in a new tab
    window.open("https://events.my-sport.ch/kurs/"+this._id, '_blank');
   
    // this would be default. --> open the page at the same spot. 
    // Router.go('kurs', {_id: this._id});

    }
});

Template.tableHeaderIframe.events({

  'click .sort': function (event, template) {

    var sort = {},
        value = 1,
        $item = $(event.currentTarget);
        $items = $(template.findAll('.sort'));
        // remove classes 
        $items.removeClass('asc desc');

        _.each(Session.get('kurs_table_sort_iframe'), function (direction) {
            if (direction === 1){
                value = -1;
                $item.addClass('desc');
            }else{
                value = 1;
                $item.addClass('asc');
            }
        });

        sort[event.currentTarget.getAttribute("data-sort")] = value;
        Session.set('kurs_table_sort_iframe', sort );

        //console.log(Session.get('kurs_table_sort'));
  }
});

