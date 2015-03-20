
if (Meteor.isClient){

   
   T9n.language = "de";

   Accounts.ui.config({
      passwordSignupFields: 'USERNAME_AND_EMAIL'
   });

   AccountsEntry.config({
      homeRoute: '/',                    // mandatory - path to redirect to after sign-out
      dashboardRoute: '/account',      // mandatory - path to redirect to after successful sign-in
      profileRoute: 'account',
      passwordSignupFields: 'USERNAME_AND_EMAIL',
      showSignupCode: false,
      showOtherLoginServices: false      // Set to false to hide oauth login buttons on the signin/signup pages. Useful if you are using something like accounts-meld or want to oauth for api access
    });

   Template.Kurs.AnzahlKurse = function () {
      return Template[this.postName];
   };


   Template.Kurs.rendered=function() {
    		
   var kurs = this.data || {};
   var anzahlKurse = kurs.Kursdaten.Daten.length || 0;

   $('#calendar_embeded').datepicker({
      todayHighlight: true,
      todayBtn: true,
      language: "de",
      beforeShowDay: function (date){
      				
         for(var i = 0; i < anzahlKurse; i++){

            if (   (date.getMonth() == (new Date(kurs.Kursdaten.Daten[i])).getMonth()) 
     		&& (date.getYear()  == (new Date(kurs.Kursdaten.Daten[i])).getYear())
		&& (date.getDate()  == (new Date(kurs.Kursdaten.Daten[i])).getDate())){
					
		// console.log(kurs);
				
                return {
                   tooltip: kurs.Beschreibung.B1 +" - "+ moment(new Date(kurs.Kursdaten.Daten[i])).format("dddd,D.MMMM YYYY, hh:mm")+" Uhr",
                   classes: 'active'
                   }; 
		}	
            }
            return false; // not selectable 
	}
   });
   }
    
    
}

