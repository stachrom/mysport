

Meteor.startup(function () {
	
   // Roles.createRole("admin");
   // Roles.createRole("trainer");
   var role = ['admin', 'trainer'];

   //console.log(role); 
 
   var roles = Roles.getAllRoles();

   // http://alanning.github.io/meteor-roles/classes/Roles.html#method_setUserRoles
   // Roles.setUserRoles([user1, user2], ['trainer'])
   Roles.addUsersToRoles('xwiWMCagf5FWghCS8', role );
   Roles.addUsersToRoles('RP3LFTcYJrvzcdEAA', role );
   Roles.addUsersToRoles('q29enr9d3uLXqwCEk', role );
   Roles.addUsersToRoles('EhkpjeHDiZqFkkkCq', role );
});



