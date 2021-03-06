

Meteor.publish('kurse', function(kurs_id, user_id, tags, art){
        // Find all the Kurse
       check(arguments, [Match.Any]);

       var whereClausel= {"Delete": { $exists: false}};
       var fields={rsvps: 0};

       if (Roles.userIsInRole(this.userId, ['admin', 'trainer'])) {
          fields={};
       }

       if ( Match.test(kurs_id, String)){
             whereClausel = {_id:kurs_id, "Delete": { $exists: false}};
       }
       if (Match.test(tags, String) && Match.test(art, String) ){
             whereClausel = {"Activ": true, "Art": art, "Tag": {$in: [tags]}, "Delete": { $exists: false}};
       }

       var data =  Kurse.find( whereClausel, {fields: fields, sort: { "Kursdaten.Start": 1 }}); 
       return data;
});

Meteor.publish("users", function (user_id, action) {
  
  check(arguments, [Match.Any]);
  //check(user_id, Match.Optional(String));
  //check(action, Match.Optional(String));

  var whereClausel = {};

  if (Roles.userIsInRole(this.userId, ['admin'])) {
     whereClausel={};
  }else {
     whereClausel={_id: this.userId};
  }


  if (action === "kursleiter" && user_id){


        whereClausel={_id: user_id};


  }
console.log(whereClausel);
   data = Meteor.users.find(
             whereClausel,
             {fields:{
                'emails': 1,
                'createdAt': 1,
                'profile': 1,
                }
             }
          );
   // console.log(data.fetch().length);

   return data;
                
});


Meteor.publish("adressen", function (searchString, addressid) {

    var whereClause = {};
    check(arguments, [Match.Any]); 
  
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
   
	return result;
});

