
Kurse = new Mongo.Collection("kurse");
Adressen = new Mongo.Collection("adressen");


var Future = Npm.require("fibers/future");
    
Meteor.startup(function () {

   var aggregate = function(pipeline) {
      
      var self = this;
      var future = new Future;

      self.find()._mongo.db.createCollection(self._name, function (err, collection) {
         if (err) {
            future.throw(err);
            return;
         }
         collection.aggregate(pipeline, function(err, result) {
            if (err) {
               future.throw(err);
               return;
            }
            future.return([true, result]);
         });
      });
    
      var result = future.wait();
    
      if (!result[0])
         throw result[1];

      return result[1];
   };
  
   var distinct = function(pipeline) {
      var self = this;
      var future = new Future;
      self.find()._mongo.db.createCollection(self._name, function (err, collection) {
      if (err) {
        future.throw(err);
        return;
      }
      collection.distinct(pipeline, function(err, result) {
        if (err) {
          future.throw(err);
          return;
        }
        future.return([true, result]);
      });
    });
    
    var result = future.wait();
    
    if (!result[0])
      throw result[1];

    return result[1];
  };
 
  Kurse.aggregate = aggregate;
  Kurse.distinct = distinct;

}); 



  
Meteor.methods({

    kurseUnwinde: function() {

        var data = Kurse.aggregate([
               { $match : { Public : 1 }},
               { $project:
                   {   kurs_id: "$_id",
                       _id:  0,
                       Tag : 1,
                       Art : 1,
                       Titel : "$Beschreibung.B1",
                       Dauer : "$Kursdaten.Dauer",
                       Zeit : "$Kursdaten.Uhrzeit",
                       Daten : "$Kursdaten.Daten"
               }},
               { $unwind : "$Daten" },
               { $match : { Daten : { $gt: new Date() } } },
               { $sort : { Daten:1 } }
       ]);
          
       //console.log(data); 
       
       return data; 

    },
    
    rsvp: function(kursId, rsvp, price) {
    	
       check(kursId, String);
       check(rsvp, String);


       if(Match.test(price, String)){
   
       }else{

           throw new Meteor.Error(406, "Bitte Wählen sie einen Preis");

       }

       check(price, String);
	   
       if (! this.userId)
           throw new Meteor.Error(403, "You must be logged in to RSVP");
       if (! _.contains(['yes', 'no', 'maybe'], rsvp))
           throw new Meteor.Error(400, "Invalid RSVP");
	      
	var kurs = Kurse.findOne(kursId);
	    
	if (! kurs)
	      throw new Meteor.Error(404, "No such course");
	if (! kurs.Public )
	      throw new Meteor.Error(403, "No such course"); 
	      
	var rsvpIndex = _.indexOf(_.pluck(kurs.rsvps, 'user'), this.userId); 
	
 	if (rsvpIndex !== -1) {
	// update existing rsvp entry
	Kurse.update(
		{_id: kursId, "rsvps.user": this.userId},
		{$set: {"rsvps.$.rsvp": rsvp, "rsvps.$.price": price,  "rsvps.$.date": new Date()}}
	      );
 	} else {
	// add new rsvp entry
	Kurse.update(kursId,
		{$push: {rsvps: {user: this.userId, rsvp: rsvp, price: price, date: new Date()}}}
	);
 	}	    

    }
});   
