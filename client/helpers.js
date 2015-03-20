//  format an ISO date using Moment.js
//  http://momentjs.com/
//  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
//  usage: {{dateFormat creation_date format="MMMM YYYY"}}

UI.registerHelper('dateFormat', function(context, block) {

   moment.locale("de");

   if (window.moment && context && moment(context).isValid()) {
        var f = block.hash.format || "DD MM YYYY";
        //moment.lang(Session.get("sprache"));


        return moment(context).format(f);
   }else{
        return context;   //  moment plugin not available. return data as is.
   };

});



//Truncates string
UI.registerHelper ( 'truncate', function ( str, len ) {

    if (str.length > len) {
        var new_str = str.substr ( 0, len+1 );

        while ( new_str.length )
        {
            var ch = new_str.substr ( -1 );
            new_str = new_str.substr ( 0, -1 );

            if ( ch == ' ' ) {
                break;
            }
        }

        if ( new_str == '' )
        {
            new_str = str.substr ( 0, len );
        }

        return new Handlebars.SafeString ( new_str +'...' ); 
    }
    return str;
} );


UI.registerHelper ('isAdminUser', function() {

    // check if user is an admin
    return Roles.userIsInRole(Meteor.user(), ['admin']);

});



UI.registerHelper('routeIsActive', function (routeName, text) {

   var currentRoute = Router.current();
   if (!currentRoute) return '';

   if(routeName === currentRoute.path ) {
	 return 'active';
   }
  
});

