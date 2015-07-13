Template.navigation.events({

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
        },
        'click .export': function (event) {
          
            Meteor.call('xmlExportAdressen', function (error, result) {
               console.log(error);
               console.log(result);
            });

       
        },
        'click .profileLink': function(event){

          Session.set("user_id", null)

      }

});



