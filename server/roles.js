

Meteor.startup(function () {
	
   //Roles.createRole("admin");
   var role = ['admin'];

   //console.log(role); 
 
   var roles = Roles.getAllRoles();
 
   // Roles.addUsersToRoles('xwiWMCagf5FWghCS8', role );
   Roles.addUsersToRoles('RP3LFTcYJrvzcdEAA', role );
   Roles.addUsersToRoles('q29enr9d3uLXqwCEk', role );
   Roles.addUsersToRoles('EhkpjeHDiZqFkkkCq', role );
});



