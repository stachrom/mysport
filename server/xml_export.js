var fs = Npm.require('fs');
var Future = Npm.require("fibers/future"); 
var filePath = '/home/my-sport/export/';

var users = Meteor.users.find({}, {fields: {'_id': 1, 'profile':1}}).fetch();


Meteor.methods({


    exportKursAnmeldungen: function(user, address_id){

        var user_id = user._id;
        var booked_kurse = Kurse.find(
                {rsvps : {$elemMatch : { user: user_id, rsvp: "yes" } } },
                {fields: {'Kursnummer': 1, 'rsvps':1}} 
            ).fetch();


        // exportiere nur kursanmeldungen von usern, welche auch tatsächlich eine Anmeldung haben.  
	if(booked_kurse.length !== 0){

           var xml = XmlBuilder.create('Kurs_Anmeldungen', {version: '1.0', encoding: 'UTF-8'});

           for( var i = 0; i < booked_kurse.length; i++){

              var booking = _.filter( booked_kurse[i].rsvps, function(doc){
                 return (doc.user == user_id && doc.rsvp === "yes" );
              });

              if(booking.length !== 0){

                 // console.log(booking);
                 // mark rsvp as exported. 
 
                 Kurse.update( {_id: booked_kurse[i]._id, "rsvps.user": user_id},
                    {$set: {"rsvps.$.rsvp": "exported"}}
                 );

                 xml.ele('Anmeldung')
                    .ele('Kursnummer', booked_kurse[i].Kursnummer)
                    .insertAfter('Adressnummer', address_id )
                    .insertAfter('Anmeldungsdatum', {FORMAT:"dd.MM.yyyy"}, moment(booking[0].date).format("DD.MM.YYYY") )
                    .insertAfter('Preis', booking[0].price);
              }
           }
           //console.log(booking);
           if(booking.length !== 0){
              return xml.end({ pretty: true});
           }else{
              xml.end();
           }
        }
     },
     exportAdresse: function(user, adress_id){
      
        var Adresse = user && user.profile ? user.profile.Adresse : {};
        var Kommunikation = user && user.profile ? user.profile.Kommunikation : {};
        var Admin = user && user.profile ? user.profile.Admin : {};
        var GBDate = user && user.profile ? user.profile.GBDatum : {};
        // to-do: e-mail account  
 
       
        var xml = XmlBuilder.create('Kurs_Adressen', {version: '1.0', encoding: 'UTF-8'});

            xml.ele('Adressen')
               .ele('ADRESSNUMMER',    adress_id )
               .insertAfter('ANREDE',  Adresse.Anrede || '' )
               .insertAfter('NAME', Adresse.Name || '' )
               .insertAfter('ABTEILUNGZHD', Adresse.ZuHandenVon || '' )
               .insertAfter('STRASSE', Adresse.Strasse || '' )
               .insertAfter('VORNAME', Adresse.Vorname || '' )
               .insertAfter('PLZ', Adresse.PLZ || '' )
               .insertAfter('ORTSCHAFT', Adresse.Ortschaft || '' )
               .insertAfter('ADRESSZUSATZ', Adresse.Adresszusatz || '' )
               .insertAfter('TELEFONGESCHAEF', Kommunikation.Telg || '' )
               .insertAfter('TELEFONPRIVAT', Kommunikation.Telp || '' )
               .insertAfter('MOBILNUMMER', Kommunikation.Telm || '' )
               .insertAfter('CODE1_KDSTATUS',  Admin.Type || '' )
               .insertAfter('CODE2_RES1',      Admin.Res1 || '' )
               .insertAfter('CODE3_PRIVGESCH', Admin.Privgesch || '' )
               .insertAfter('CODE4_RES2',      Admin.Res2 || '' )
               .insertAfter('POSTFACH', Adresse.Postfach || '' )
               .insertAfter('EMAILADRESSE', Kommunikation.Email || '' )
               .insertAfter('GEBURTSDATUM', {FORMAT:"dd.MM.yyyy"}, moment(GBDate).format("DD.MM.YYYY") || '' )
               .insertAfter('ESHOPADRESSE', "1" );


        return xml.end({ pretty: true});
     },
     exportAdresse_KursAnmeldungen: function (user){

        var user_id = user._id;
        var profile = user.profile;

        if (profile && profile.Admin){
           var id = Adressen.find(
              { _id: profile.Admin.LinkedTo},
              { fields: {'Adress_id':1} }
           ).fetch();
        }else{
           var id = {};
        }


        if (id[0] && id[0].Adress_id) {
           var Adress_id = id[0].Adress_id;
        }
        var booked_kurse = Kurse.find(
                {rsvps : {$elemMatch : { user: user_id, rsvp: "yes" } } },
                {fields: {'Kursnummer': 1, 'rsvps':1}}
            );


//console.log(booked_kurse.count());

        if(booked_kurse.count() !== 0){
        // only call exportAdresse if we have a corresponding booking
        Meteor.call('exportAdresse', user, Adress_id, function (err, result){
        //console.log(err);           

          if (err === undefined){

              var adresse = "europa3000kurs_adresse_"+ Adress_id +".xml";
              if(result !== undefined){
              //console.log(result);
                 fs.writeFile(filePath + adresse, result, 'utf-8', function(err) {
                    if (err) {
                       throw (new Meteor.Error(500, 'Failed to save file.', err));
                    } else {
                       console.log('The file ' + adresse + ' was saved to ' + filePath);
                    }
                 });
              }
           }
        });
        }

        Meteor.call('exportKursAnmeldungen', user, Adress_id, function (err, result) {

           if (err === undefined){

              var kursanmeldung = "europa3000kurs_anmeldung_"+ Adress_id +".xml";

              if(result !== undefined){

                 //console.log(result);

                 fs.writeFile(filePath + kursanmeldung, result, 'utf-8', function(err) {
                    if (err) {
                       throw (new Meteor.Error(500, 'Failed to save file.', err));
                    } else {
                       console.log('The file ' + kursanmeldung + ' was saved to ' + filePath);
                    }
                 });
              }
           }else{
                 console.log("*** Error " + err);
           }
        });
     }
});


// Diese Funktion wird alle Stunde aufgerufen --> 60*60*1000
Meteor.setInterval( function() {

    var d = new Date(),
        minutes = d.getMinutes(),
        hours = d.getHours();

    // ab 23 Uhr findet der Export statt
    if (hours === 23 ){

        for( var i = 0; i < users.length; i++){

            var user = users[i];
        
            Meteor.call('exportAdresse_KursAnmeldungen', user, function (error, result) {
               //console.log(error);
               //console.log(result);
           });
   }

  }else{
     console.log("export: "+ hours+":"+minutes );
  }
}, 60*60*1000);





/*



*/
//console.log(xml);

