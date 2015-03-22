

Meteor.publishComposite('kurseErweitert', function(kurs_id, user_id, tags, art){
  return {    
    find: function() {
        // Find all the Kurse
       var whereClausel= {};
    
       if ( Match.test(kurs_id, String)){
             whereClausel = {_id:kurs_id};
       }
       if (Match.test(tags, String) && Match.test(art, String) ){
             whereClausel = {"Public": 1, "Art": art, "Tag": {$in: [tags]}};
       }

       var data =  Kurse.find( whereClausel, {sort: { "Kursdaten.Start": 1 }}); 

       return data;
    },
    children: [
        {
          collectionName : "Location",
          find: function(kurs) {
             var adresse = Adressen.find(
                    { Adress_id: kurs.Adress_id },
                    { limit: 1, 
                      fields: {'Name': 1, 'Ortschaft': 1, 'Adress_id': 1, 'Strasse':1, 'Plz':1 }
                    }
                );
          
             //console.log(adresse.fetch());
             return adresse;
            }
        },
        {
          collectionName : "Kursleiter",
          find: function(kurs) {
             var adresse = Adressen.find(
                    { Adress_id: kurs.Kurs_Leitung_id },
                    { limit: 1,  
                      fields: {'Name': 1, 'Vorname': 1, 'Adress_id': 1 }
                    }
                );

             //console.log(adresse.fetch());
             return adresse;
            }
        } 
          
    ]
 }
});

Meteor.publish("users", function () {
  return Meteor.users.find(
                        {},
                        {fields:{
                            'emails': 1, 
                            'createdAt': 1,
                            'profile': 1,
                            }
                        }
                        );
                
});


Meteor.publish("adressen", function (searchString, addressid) {

    var whereClause = {};
    
    //console.log(addressid);
    //console.log(searchString);	
   
    if(Match.test(searchString, String)){
	whereClause ={
	    $or : [
    	        {"Name": {$regex: searchString, $options: 'i'}},
                {"Ortschaft": {$regex: searchString, $options: 'i'}},
                {"Vorname": {$regex: searchString, $options: 'i'}}
            ]
        };
        



    }else{
	   whereClause ={"_id": addressid};
    }
    var result = Adressen.find( 
        whereClause,
        {fields: {},
        sort: {'Name': 1}, 
        limit: 50
        });
      //console.log(result.fetch());    
	return result;
});

