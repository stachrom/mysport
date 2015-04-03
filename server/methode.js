
Kurse = new Mongo.Collection("kurse");
Adressen = new Mongo.Collection("adressen");

Meteor.methods({

    anmeldungenUnwind: function(user, options){
    
       var options = options || {};
       var data = Kurse.aggregate([
               { $match : {"rsvps.rsvp": { $in: [ 'exported' ] } }},
               { $unwind : "$rsvps" },              
               { $project:
                   {   kurs_id: "$_id",
                       _id:  0,
                       Kursnummer: "$Kursnummer",
                       Titel : "$Beschreibung.B1",
                       Rsvp :  "$rsvps.rsvp",
                       Preis : "$rsvps.price",
                       Kunde : "$rsvps.user",
                       Username: "$rsvps.username",
                       Buchungsdatum : "$rsvps.date"
               }},
               { $match : {"Rsvp": 'exported' }},
               { $sort : { Buchungsdatum: -1 } }
       ]);

       //console.log(data);
       return data;

    },
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
                       Daten : "$Kursdaten.Daten.date"
               }},
               { $unwind : "$Daten" },
               { $match : { Daten : { $gt: new Date() } } },
               { $sort : { Daten: -1 } }
       ]);
          
      //console.log(data); 
       
       return data; 

    },
    
    rsvp: function(kursId, rsvp, price) {
    	
       check(kursId, String);
       check(rsvp, String);
       var user = Meteor.users.findOne(
                    {_id: this.userId},
                    {fields: {'username': 1}}
                   );


       if(Match.test(price, String)){
   
       }else{

           throw new Meteor.Error(406, "Bitte Wählen sie einen Preis");

       }

       check(price, String);
	   
       if (! this.userId)
           throw new Meteor.Error(403, "You must be logged in to RSVP");
       if (! _.contains(['yes', 'no'], rsvp))
           throw new Meteor.Error(400, "Invalid RSVP");
	      
	var kurs = Kurse.findOne(kursId);
	    
	if (! kurs)
	      throw new Meteor.Error(404, "No such course");
	if (! kurs.Public )
	      throw new Meteor.Error(403, "this course is no longer available"); 
	      
	var rsvpIndex = _.indexOf(_.pluck(kurs.rsvps, 'user'), this.userId); 
	
 	if (rsvpIndex !== -1) {
	// update existing rsvp entry
	Kurse.update(
		{_id: kursId, "rsvps.user": this.userId},
		{$set: {"rsvps.$.rsvp": rsvp, "rsvps.$.username": user.username, "rsvps.$.price": price,  "rsvps.$.date": new Date()}}
	      );
 	} else {
	// add new rsvp entry
	Kurse.update(kursId,
		{$push: {rsvps: {user: this.userId, username: user.username, rsvp: rsvp, price: price, date: new Date()}}}
	);
 	}	    

    },
    fakturieren:function(kursId, rsvp, userId){

       check(kursId, String);
       check(rsvp, String);
       check(userId, String);

       var loggedInUser = Meteor.user();

       if (! _.contains(['exported', 'fakturiert'], rsvp))
           throw new Meteor.Error(400, "Invalid RSVP");

       if (! Roles.userIsInRole(loggedInUser, ['admin']))
           throw new Meteor.Error(400, "You are not permitted to do so");

       var result= Kurse.update(
                {_id: kursId, "rsvps.user": userId},
                {$set: {"rsvps.$.rsvp": rsvp}}
          );

       return result;

       }

});   
