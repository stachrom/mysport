
var fs = Npm.require('fs'),
    Future = Npm.require("fibers/future"),
    basepath = process.env.PWD + "/";
    

 Meteor.methods({
    load_xml_data_from_File: function(basepath, xmlFilePath) {
        var future = new Future();
        var loggedInUser = Meteor.user();

        if (!loggedInUser ||
            !Roles.userIsInRole(loggedInUser,['admin'])) {
               throw new Meteor.Error(403, "Access denied");
        }

        fs.readFile(basepath + xmlFilePath, function(err, data) {
            if(data){
                var json = XML2JS.parse(data);
                if(json){
                    //future.ret(json);
                    future.return(json);
                }
            }else{
                console.log("*** Error " + err);
            }
        });
        return future.wait();
    },
    kurseImportMongodb:  function(json) {
        var kurse = {};
	var loggedInUser = Meteor.user();

        if (!loggedInUser ||
            !Roles.userIsInRole(loggedInUser,['admin'])) {
               throw new Meteor.Error(403, "Access denied");
        }

        if(json.europa3000_Kurse_Se && json.europa3000_Kurse_Se._Kurse_Seminare ){

                kurse = json.europa3000_Kurse_Se._Kurse_Seminare;
            var length = kurse.length;
            var data = {};
                //Kurse.remove({});

            for (var i=0; length > i; i++  ){

               if( kurse[i].KURSBEGINN.length === 10 ){
                  var start =  new Date(moment(kurse[i].KURSBEGINN +" "+ kurse[i].UHRZEITVON , "DD.MM.YYYY HH:mm").format("YYYY-MM-DD HH:mm")) 
               }else{
                  var start =  "";
               }

               if ( kurse[i].KURSENDE.length === 10) {
                   var stop = new Date(moment(kurse[i].KURSENDE +" "+ kurse[i].UHRZEITBIS, "DD.MM.YYYY HH:mm").format("YYYY-MM-DD HH:mm")) 
               }else{ 
                   var stop = new Date(moment(kurse[i].KURSBEGINN +" "+ kurse[i].UHRZEITBIS , "DD.MM.YYYY HH:mm").format("YYYY-MM-DD HH:mm"))
               }


                data = {
                    Kursnummer : kurse[i].KURSNUMMER,
                    Created: new Date(),
                    Beschreibung :{
                        B1: kurse[i].KURSBESCHREIB1,
                        B2: kurse[i].KURSBESCHREIB2,
                        B3: kurse[i].KURSBESCHREIB3,
                        Lehrmittel:{
                            L1: kurse[i].LEHRMITTEL1,
                            L2: kurse[i].LEHRMITTEL2
                        },
                        Bemerkungen:{
                            B1: kurse[i].BEMERKUNGEN1,
                            B2: kurse[i].BEMERKUNGEN2
                        },
                        Sprache: kurse[i].KURSSPRACHE
                    },
                    Kursdaten:{
                        Start: start,
                        Stop:  stop,
                        Uhrzeit: kurse[i].UHRZEITVON,
                        Dauer: "",
                        Daten: [],
                        Wochentage:[]
                    },
                    Lektionen: kurse[i].ANZ_LEKTIONEN, 
                    Teilnehmer:{
                        Max: parseInt( kurse[i].MAX_TEILNEHMER, 10),
                        Min: parseInt( kurse[i].MIN_TEILNEHMER, 10),
                        Anzahl: {
                            Angemeldet: parseInt( kurse[i].TEILNEHMERAKT, 10),
                            Display:  parseInt( kurse[i].ANZAHL_TEILN, 10) 
                        }
                    },
                    Preise:[
                        {
                           Value: Number(kurse[i].KURSPREIS1CHF),
                           Beschreibung: kurse[i].KURSPREIS1BE
                        },
                        {
                           Value: Number( kurse[i].KURSPREIS2CHF),
                           Beschreibung: kurse[i].KURSPREIS2BE
                        },
                        {
                           Value: Number( kurse[i].KURSPREIS3CHF),
                           Beschreibung: kurse[i].KURSPREIS3BE
                         },
                        {
                           Value: Number( kurse[i].KURSPREIS4CHF),
                           Beschreibung: kurse[i].KURSPREIS4BE
                        },
                        {
                           Value:  Number( kurse[i].KURSPREIS5CHF ),
                           Beschreibung: kurse[i].KURSPREIS5BE
                        }



                    ],
                    Kurs_Leitung_id: kurse[i].KURSLEITERNR,
                    Adress_id: kurse[i].KURSORT,
                    Art: kurse[i].KURSART,
                    Level: function(kurse, i){
                           
                              var Level=[];

                              if(kurse[i].EINSTEIGER = 1){
                                   Level.push('Einsteiger');
                              };
                              if(kurse[i].ANFÄNGER = 1){
                                   Level.push('Anfänger');
                              };
                              if(kurse[i].MITTLERE = 1){
                                   Level.push('Mittlere');
                              };
                              if(kurse[i].FORTGESCHRITTENE = 1){
                                   Level.push('Fortgeschrittene');
                              };
                              return Level;
                    }(kurse, i),
                    Tag: [],
                    Activ: true
                };
                
                // Dauer des Kurses in h
                if(kurse[i].UHRZEITBIS && kurse[i].UHRZEITVON ){
                
                    var bis = moment(kurse[i].UHRZEITBIS, "HH:mm");
                    var von = moment(kurse[i].UHRZEITVON, "HH:mm"); 

                    // console.log(bis.diff(von, "hours", true));
                    data.Kursdaten.Dauer = bis.diff(von, "hours", true);   

                }
                

                for (var prop in kurse[i]) {

                    if(kurse[i].hasOwnProperty(prop) && prop.match('KURSDATUM') ){

                        if(kurse[i][prop]){
                            //console.log(moment(kurse[i][prop], "DD.MM.YYYY").isValid());
                            moment(kurse[i][prop], "DD.MM.YYYY").isValid() === true 
                                   && data.Kursdaten.Daten.push( 
                                      {date : new Date(
                                         moment(kurse[i][prop]+" "+ kurse[i].UHRZEITVON, "DD.MM.YYYY HH:mm").format("YYYY-MM-DD HH:mm")
                                      )}
                                   );
                           }
  
                    }
                    if(kurse[i].hasOwnProperty(prop) && prop === 'SPORTART_SCHWIMMEN' && kurse[i][prop] == 1) {
                        data.Tag.push("Schwimmen");
                    }
                    if(kurse[i].hasOwnProperty(prop) && prop === 'SPORTART_KRAFT' && kurse[i][prop] == 1) {
                        data.Tag.push("Kraft");
                    }
                    if(kurse[i].hasOwnProperty(prop) && prop === 'SPORTART_LAUFEN' && kurse[i][prop] == 1) {
                        data.Tag.push("Laufen");
                    }
                    if(kurse[i].hasOwnProperty(prop) && prop === 'SPORTART_VELO' && kurse[i][prop] == 1 ){
                        data.Tag.push("Velo");
                    }
                    if(kurse[i].hasOwnProperty(prop) && prop === 'SPORTART_DIVERSE' && kurse[i][prop] == 1 ){
                        data.Tag.push("Divers");
                    }
                }
                //console.log(data);

                var kurs = Kurse.findOne({Kursnummer : kurse[i].KURSNUMMER,});

                    if(Match.test(kurs, undefined )){
                    // if the Cours does not exist, create a new one. 
                        id = Kurse.insert(data);
                    }else{
                    // lets do a update - shall we?
                    // remove the create date from the data object. 
                       delete data.Created;
                       //console.log(kurse[i].KURSENDE.length);
                       id = Kurse.update({_id: kurs._id },{ $set: data });
                    }
                   // console.log(id);
            }
        }else{
            console.log("keine Kurse zu Importieren");
           
        }

    },
    europa3000UserImportMongodb: function(json) {
    
        var adressen = {};
        var loggedInUser = Meteor.user();

        if (!loggedInUser ||
            !Roles.userIsInRole(loggedInUser,['admin'])) {
               throw new Meteor.Error(403, "Access denied");
        }
        
        if(json.europa3000_Adressen &&  json.europa3000_Adressen.Adressen ){

            adressen = json.europa3000_Adressen.Adressen;
            
            var length = adressen.length;
            var data = {};
            var id = 0;

            // Adressen.remove({});

            for (var i=0; length > i; i++  ){ 

                    data = {
                        Adress_id : adressen[i].ADRESSNUMMER,
                        Created: new Date(),
                        Firma: adressen[i].FIRMA,
                        Anrede: adressen[i].ANREDE,
                        Name: adressen[i].NAME,
                        Vorname: adressen[i].VORNAME,
                        ZuHandenVon: adressen[i].ABTEILUNGZHD,
                        Strasse: adressen[i].STRASSE,
                        Plz: adressen[i].PLZ,
                        Ortschaft: adressen[i].ORTSCHAFT,
                        Zusatz: adressen[i].ADRESSZUSATZ,
                        Email: adressen[i].EMAILADRESSE,
                        Homepage: adressen[i].HOMEPAGE,
                        Mob: adressen[i].MOBILNUMMER,
                        Fax: adressen[i].TELEFAX,
                        Telg: adressen[i].TELEFONGESCHAEF,
                        Telp: adressen[i].TELEFONPRIVAT,
			Postfach: adressen[i].POSTFACH,
			GBDatum: adressen[i].GEBURTSDATUM,
                        IsLinked: [i].ESHOPADRESSE,
                        Type: adressen[i].CODE1_KDSTATUS,
			PivatGeschaeft: adressen[i].CODE3_PRIVGESCH,
			Res1: adressen[i].CODE2_RES1,
			Res2: adressen[i].CODE4_RES2   
                    };
                    
                    //console.log(data);
                    var adresse = Adressen.findOne({Adress_id : adressen[i].ADRESSNUMMER});

                    if(Match.test(adresse, undefined )){
                    // if the Adress does not exist, create a new one. 
                        id = Adressen.insert(data);
                    }else{
                    // lets do a update - shall we?
                       id = Adressen.update({_id: adresse._id }, { $set: data });
                    }
		
            }
        
        }
    
   }

});

   Meteor.setInterval( function() {
   // Diese Funktion wird alle Stunde aufgerufen --> 60*60*1000
    var d = new Date(),
        minutes = d.getMinutes(),
        hours = d.getHours();
    // Datenimport morgnes ab 4 Uhr. 
    if (hours === 4 ){
        console.log(minutes);
	// Morgens um Zwei Uhr sollen die Daten importiert werden
       Meteor.call('load_xml_data_from_File', '/home/my-sport/import/', 'kurse.xml', function (err, result) {
          if (result){
            Meteor.call('kurseImportMongodb', result);
          }else{
             console.log("*** Error " + err);
          }
       });

       Meteor.call('load_xml_data_from_File', '/home/my-sport/import/', 'adressen.xml', function (err, result) {
          if (result){
             Meteor.call('europa3000UserImportMongodb', result);
          }else{
             console.log("*** Error " + err);
          }   
       }); 
        
    }else{
        console.log( hours+":"+minutes );
    }


}, 60*60*1000); 


