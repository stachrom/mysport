
Kurse = new Mongo.Collection("kurse");
Adressen = new Mongo.Collection("adressen");

Meteor.methods({

anmeldungenUnwind: function(options){
  
   if(options === null || options === undefined){

      var data = Kurse.aggregate([
               { $unwind : "$rsvps" },
               { $project:
                   {   _id:  0,
                       Rsvp :  "$rsvps.rsvp",
                       Preis : "$rsvps.price",
                       Kunde : "$rsvps.user"
               }},
               { $group: 
                  { _id: "$Rsvp",
                    count: {$sum:1},
                    total: {$sum: "$Preis"}
               }}
           ]);

         return {"statistik": data};

   }else{

      check(options, {
         date : Match.Optional(Date),
         rsvp : Match.Optional(String),
         user : Match.Optional(Object),
         kurs : Match.Optional(Object)
      });

      var and_1 = _.map(options, function(value, key){ 

         if(key === "date"){
            return {"rsvps.date": { $gte: options.date, $lte: moment(value).endOf('month').toDate()}};
         }
         if(key === "kurs" && value.id){
            return {"_id": value.id};
         } 
         if(key === "rsvp"){
            return {"rsvps.rsvp": value};
         }
         if(key === "user" && value.id){
            return {"rsvps.user": value.id };
         }
      });

      var and_2 = _.map(options, function(value, key){
   
         if(key === "date"){
            return {"Buchungsdatum": { $gte: options.date, $lte: moment(value).endOf('month').toDate()}};
         }
         if(key === "rsvp"){
            return {"Rsvp": value};
         } 
         if(key === "user"&& value.id){
            return {"Kunde": value.id};
         }
         if(key === "kurs" && value.id){
            return {};
         }
      });

      var match1 = { $match : { $and: and_1 }};
      var match2 = { $match : { $and: and_2 }};

      var data = Kurse.aggregate([
               match1,
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
                       Beschreibung: "$rsvps.beschreibung",
                       BerichtigtZurTeilnahme:"$rsvps.berechtigtZurTeilnahme",
                       Buchungsdatum : "$rsvps.date"
               }},
               match2,
               { $sort : { Buchungsdatum: -1 } },
               { $limit : 100 }
      ]);
   }

    //console.log(data);
    return {"buchungen": data};

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
		{$set: {"rsvps.$.rsvp": rsvp, "rsvps.$.username": user.username, "rsvps.$.price": parseFloat(price),  "rsvps.$.date": new Date()}}
	      );
 	} else {
	// add new rsvp entry
	Kurse.update(kursId,
		{$push: {rsvps: {user: this.userId, username: user.username, rsvp: rsvp, price: parseFloat(price), date: new Date()}}}
	);
 	}	    

    },
    fakturieren:function(kursId, rsvp, userId){

       check(kursId, String);
       check(rsvp, String);
       check(userId, String);

       var loggedInUser = Meteor.user();

       if (! _.contains(['exported', 'fakturiert', 'warteliste', 'yes', 'no'], rsvp))
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
