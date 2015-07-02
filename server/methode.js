
Kurse = new Mongo.Collection("kurse");
Adressen = new Mongo.Collection("adressen");

Meteor.methods({

anmeldungenUnwind: function(options){
  
   check(arguments, [Match.Any]);

   if(options === null || options === undefined){

      var data = Kurse.aggregate([
               { $unwind : "$rsvps" },
               { $project:
                   {   _id:  0,
                       Rsvp :  "$rsvps.rsvp",
                       Preis : "$rsvps.price",
                       Kunde : "$rsvps.user"
               }},
               { $unwind : "$Preis.Value" },
               { $group: 
                  { _id: "$Rsvp",
                    count: {$sum:1},
                    total: {$sum: {$multiply: [ "$Preis.Value", "$Preis.Anzahl" ]}}
               }}
           ]);

         return {"statistik": data};

   }else{
/*
      check(options, {
         date : Match.Optional(Date),
         rsvp : Match.OneOf(String, Object),
         user : Match.Optional(Object),
         kurs : Match.Optional(Object)
      });
*/
      var and_1 = _.map(options, function(value, key){ 

         if(key === "date"){
            return {"rsvps.date": { $gte: options.date, $lte: moment(value).endOf('month').toDate()}};
         }
         if(key === "kurs" && value.id){
            return {"_id": value.id};
         } 
         if(key === "rsvp"){
            if (_.isString(value) ){
               return {"rsvps.rsvp": value};
            }
            if (_.isArray(value) ){
	      var or = _.map(value, function(status){
                 return {"rsvps.rsvp": status };
              });
              return {$or: or};
            }
            return {};
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
            if (_.isString(value) ){
               return {"Rsvp": value};
            }
            return {};
           
         } 
         if(key === "user" && value.id){
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
                       bookingId: "$rsvps.bookingId",
                       Kursnummer: "$Kursnummer",
                       Titel : "$Beschreibung.B1",
                       Rsvp :  "$rsvps.rsvp",
                       Preis : "$rsvps.price",
                       Kunde : "$rsvps.user",
                       Kursende : "$Kursdaten.Stop",
                       AnzahlKursdaten : { $size: { "$ifNull": [ "$Kursdaten.Daten", [] ] }}, 
                       hatTeilgenommen : { $size: { "$ifNull": [ "$rsvps.hatTeilgenommen", [] ] }}, 
                       BerechtigtZurTeilnahmeBis :       "$rsvps.berechtigtZurTeilnahmeBis",
                       Username:     "$rsvps.username",
                       Beschreibung: "$rsvps.beschreibung",
                       BerechtigtZurTeilnahme:"$rsvps.berechtigtZurTeilnahme",
                       Buchungsdatum : "$rsvps.date",
                       Beleg_id : "$rsvps.beleg.nummer",
               }},
               match2,
               { $sort : { Buchungsdatum: -1 } },
               { $limit : 100 }
         ]);
      }

      return {"buchungen": data};

    },
    kurseUnwinde: function() {

        var kurse_unwind = Kurse.aggregate([
               { $match : { Activ : true, "Delete":  { $exists: false} }},
               { $project:
                   {   kurs_id: "$_id",
                       _id:  0,
                       Tag : 1,
                       Art : 1,
                       Kursnummer : 1,
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
        var tag_distinct = Kurse.distinct("Tag");
       console.log(tag_distinct);
        return { kurse: kurse_unwind,
                 filter: tag_distinct
               };

    },
    rsvp: function(action, options){
       check(action, String);
       check(options, {
          rsvp: String,
          kursId: String,
          bookingId: Match.Optional(String),
          anzahlTeilnahmen: Match.Optional(Number),
          timestamp: Match.Optional(Date),
          price: Match.Optional(String)
       });

       var kurs = Kurse.findOne(options.kursId);
       var loggedInUser = Meteor.user();
       var result = null;

       if (! kurs)
              throw new Meteor.Error(404, "No such course");
       if (! kurs.Activ )
              throw new Meteor.Error(403, "Dieses Angebot ist nicht steht nicht mehr zur Verfügung");
       if (! _.contains(['push', 'pull', 'set', 'hatTeilgenommen', 'hatNichtTeilgenommen'], action))
           throw new Meteor.Error(400, "Invalid Action");
       if (! this.userId)
           throw new Meteor.Error(403, "You must be logged in to RSVP");
       if (! _.contains(['exported', 'fakturiert', 'warteliste', 'yes', 'no'], options.rsvp))
           throw new Meteor.Error(400, "Invalid RSVP");


       if (action === "hatTeilgenommen"){
          var date = moment(options.timestamp).toDate();
          Kurse.update(
             {_id: options.kursId, "rsvps.bookingId": options.bookingId},
             {$push: {"rsvps.$.hatTeilgenommen": date}}
          );
       }

       if (action === "hatNichtTeilgenommen"){
          var date = moment(options.timestamp).toDate();
          Kurse.update(
             {_id: options.kursId, "rsvps.bookingId": options.bookingId},
             {$pull: {"rsvps.$.hatTeilgenommen": date}}
          );
       }



       // einen Eintrag einfügen
       if (action === "push"){

          if(Match.test(options.price, String)){
             price = EJSON.parse(options.price)
          }else{
             throw new Meteor.Error(406, "Bitte Wählen sie einen Preis");
          }

          var valid_dates = _.filter(kurs.Kursdaten.Daten, function(val){
            if (val.date >= new Date ()){
               return val;
            }
          });


          result = Kurse.update(
                   {_id: options.kursId},
                   {$push: {
                      rsvps: {
                         bookingId: Random.id(),
                         user: this.userId,
                         username: loggedInUser.username,
                         rsvp: options.rsvp,
                         price: price,
                         date: new Date(),
                         berechtigtZurTeilnahmeBis: kurs.Kursdaten.Stop,
                         berechtigtZurTeilnahme: valid_dates.length
                        }       
                     }
                  }
               );

       }
       // einen eintrag entfernen
       if (action === "pull"){
         
          result = Kurse.update(
             {_id: options.kursId, "rsvps.user": this.userId},
             {$pull: {"rsvps" : {"bookingId": options.bookingId}}}
          );

       }
       // einen Eintrag ersetzen
       if (action === "set"){

          if (! Roles.userIsInRole(loggedInUser, ['admin']))
             throw new Meteor.Error(400, "You are not permitted to do so");

          var anzahl = parseInt( options.anzahlTeilnahmen, 10);

          if(Match.test(anzahl, Match.Integer) && (anzahl >= 1) ){

          }else{
             throw new Meteor.Error(400, "Geben sie eine Zahl an, welche grösser 0 ist");
          }

          if( moment(options.timestamp).isValid()){
             var date = moment(options.timestamp).toDate();
          }else{
             throw new Meteor.Error(400, "Geben sie ein End-Datum an");
          }

          result = Kurse.update(
                {_id: options.kursId, "rsvps.bookingId": options.bookingId},
                {$set: {"rsvps.$.rsvp": options.rsvp, 
                        "rsvps.$.berechtigtZurTeilnahme": anzahl, 
                        "rsvps.$.berechtigtZurTeilnahmeBis": date
                       }
                }
             );
       }

       return result;

    }

});   
