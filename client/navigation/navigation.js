Template.navigation.events({

        'keypress #search-query' : function (event, template) {
        
            var searchString =  template.find("#search-query").value + String.fromCharCode(event.which);
            var options = {
                    "searchString": searchString.replace(/(\r\n|\n|\r)/gm,""),
                    "userId": Meteor.userId()
                };
                
            if (Meteor.userId()){
                //console.log("key stroke");
                Session.set('searchString', options.searchString);
            }
        },
        'keyup #search-query' : function (event, template) {
            if (event.which === 8 && Meteor.userId() ) {
                // capter back space button
                 Session.set('searchString', template.find("#search-query").value);
                 
                 //console.log(Session.get('searchString'));
            }
        },
        'click .import': function (event) {       

            Meteor.call('load_xml_data_from_File', '/home/my-sport/import/', 'kurse.xml', function (err, result) {
               if (result){
                  // to the future of myselfe: diese sollte alles auf dem server ablaufen! 
                  // macht keinen Sinn, dass alle import daten zum client transvereiert werden!
                  // this is fucking stupid.                  
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
        }
});



