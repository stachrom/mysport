var fs = Npm.require('fs')
var Future = Npm.require("fibers/future"); 
var filePath = '/home/my-sport/export/';

var users = Meteor.users.find({}, {fields: {'_id': 1, 'profile':1}}).fetch();


Meteor.methods({

    exportKursAnmeldungen: function(userId, addressId, belegId){

        check(userId, String);
        check(addressId, String);
        check(belegId, String);

        var buchungen = Kurse.aggregate([
              { $match : 
                 { $and: 
                    [
                       {"rsvps.beleg.nummer": belegId},
                       {"rsvps.rsvp": "readyforexport"}
                    ] 
                 }
              },
              { $unwind : "$rsvps" },
              { $project:
                   {   userId: "$rsvps.user",
                       bookingId: "$rsvps.bookingId",
                       belegId: "$rsvps.beleg.nummer",
                       kursnummer: "$Kursnummer",
                       beleg_netto: "$rsvps.beleg.netto",
                       beleg_typ: "$rsvps.beleg.typ",
                       beleg_debitkonto:"$rsvps.beleg.Debitkonto",
                       beleg_kommentar: "$rsvps.beleg.kommentar",
                       titel: "$Beschreibung.B1",
                       preis: "$rsvps.price"
                   }
              },
              { $match :{"belegId": belegId} }
            ]);

        // exportiere nur kursanmeldungen von usern, welche auch tatsächlich eine Anmeldung haben.  
	if(buchungen.length !== 0){

           var user = Meteor.users.find(userId).fetch();
           var adressnummer   = user[0].profile.Admin.Adress_id;
           var netto          = buchungen[0].beleg_netto;
           var typ            = buchungen[0].beleg_typ;
           var debitKonto     = buchungen[0].beleg_debitkonto;
           var kommentarBeleg = buchungen[0].beleg_kommentar || "";
           var preisTotal     = 0;
           var XML_Zeilen     = [ ]; 

           _.each(buchungen, function(v, k){

                XML_Zeilen.push(
                   { ZEILE: {  TEXT: v.titel, '@TYP': 'Text' } },
                   { ZEILE: { '@type': 'leer' } }
                );

                Kurse.update({"rsvps": { $elemMatch: { bookingId: v.bookingId } } },
                   {$set: {"rsvps.$.rsvp": "exported"}}
                );

                _.each(v.preis, function(v2, k2){

                   preisTotal += (parseFloat(v2.Value).toFixed(2) * v2.Anzahl);

                   XML_Zeilen.push({ZEILE: {  
                                      '@TYP': 'manuell', 
                                       BEZEICHNUNG: v2.Beschreibung,
                                       MENGE: v2.Anzahl,
                                       STEUERCODE: v2.Steuercode,
                                       STEUERSATZ: v2.Steuersatz,
                                       PREIS: v2.Value,
                                       KONTO: v2.Konto,
                                       WGR: v2.WGR
                                    }
                                 });
                  });
           });
         
         
           if ( kommentarBeleg !== ""){
             XML_Zeilen.push({ ZEILE: { '@type': 'leer' } });
             XML_Zeilen.push({ ZEILE: { TEXT : kommentarBeleg, '@TYP': 'Text' } });
           }
           var beleg = {
              europa3000_Belege: {
                 Beleg:{
                    '@NETTO': netto,
                    '@TYP': typ,
                    ADRESSNUMMER: adressnummer,
                    BETRAG: preisTotal.toFixed(2),
                    DATUM: {'#text': moment(new Date()).format("DD.MM.YYYY"), '@FORMAT': 'dd.MM.yyyy'},
                    DEBIKONTO: debitKonto,
                    '#list': XML_Zeilen
                 }
              }
           };

           var xml = XmlBuilder.create(beleg, {version: '1.0', encoding: 'utf-8'});
        
           return xml.end({ pretty: true});
        }else{
              xml.end();
        }
     },
     exportAdressen: function(){
       
        var xml = XmlBuilder.create('Kurs_Adressen', {version: '1.0', encoding: 'UTF-8'});

        var Adressen = Meteor.users.find(
                             {'profile.Admin.export': true},
                             {fields: {'profile': 1}}).fetch();

        _.each(Adressen, function(user, k){
           var Adresse = user && user.profile && user.profile.Adresse ? user.profile.Adresse : {};
           var Kommunikation = user && user.profile && user.profile.Kommunikation ? user.profile.Kommunikation : {};
           var Admin = user && user.profile && user.profile.Admin ? user.profile.Admin : {};
           var GBDate = user && user.profile && user.profile.GBDatum ? moment(user.profile.GBDatum).format("DD.MM.YYYY") : "";
           var adress_id = Admin.Adress_id || "" ; 

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
               .insertAfter('GEBURTSDATUM', {FORMAT:"dd.MM.yyyy"}, GBDate )
               .insertAfter('ESHOPADRESSE', "1" );
        });

        return xml.end({ pretty: true});

     },
     xmlExportKursAnmeldungen: function (userId, belegId){

       check(userId, String);
       check(belegId, String);
       //check(arguments, [Match.Any]);

       var user = Meteor.users.find({_id: userId}, {fields: {'profile': 1}}).fetch();

       if (user[0].profile && user[0].profile.Admin && user[0].profile.Admin.Adress_id) {
           var adress_id = user[0].profile.Admin.Adress_id;
       }else{
           throw (new Meteor.Error(500, 'Das Profile ist nicht verlinkt!', err));
       }
        
       Meteor.call('exportKursAnmeldungen', userId, adress_id, belegId, function (err, result) {

           if (err === undefined){

              var kursanmeldung = "europa3000beleg_"+ adress_id +"_"+ Random.id(4)+".xml";

              if(result !== undefined){

                 var beleg_filePath = filePath + 'belege/';

                 fs.writeFile(beleg_filePath + kursanmeldung, result, 'utf-8', function(err) {
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
     },


     xmlExportAdressen: function (){

        Meteor.call('exportAdressen',function (err, result){
        console.log(err);           
          if (err === undefined){
              var adressen = "adressen.xml";
              if(result !== undefined){
              //console.log(result);
                 fs.writeFile(filePath + adressen, result, 'utf-8', function(err) {
                    if (err) {
                       throw (new Meteor.Error(500, 'Failed to save file.', err));
                    } else {
                       console.log('The file ' + adressen + ' was saved to ' + filePath);
                    }
                 });
              }
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
        
            Meteor.call('xmlExportAdressen', function (error, result) {
               //console.log(error);
               //console.log(result);
           });
   }

  }else{
     console.log("export: "+ hours+":"+minutes );
  }
}, 60*60*1000);

