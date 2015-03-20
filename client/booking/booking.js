Template.tableBodyMeineKurse.events({
	
   'click button': function (event, template) {
        	
       var data = Kurs.findOne({"Kursnummer": this.Kursnummer});

       Kurs.update(
           { _id : data._id}, 
           { $pull: 
               { 'rsvps': {user: Meteor.userId()}}
           }, 
           function(error, result){

               if ( error === undefined ){
                   console.log(result);
               }else{
                   console.log(error);

               }

           }
       );
   },
   'click td.link': function (event, template) {

	Router.go('kurs', {_id: this._id});
   }

});
