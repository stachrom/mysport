
Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'

});

Router.map(function(){


   this.route('kurse', {
        template: 'kursTabelle',
        path: '/',
        waitOn: function () {
            return Meteor.subscribe("kurse");
        },
        data:function (){

            var in_statement = {$in: [Session.get("filter")]};

            if(Session.get("filter") === ""){
                in_statement = { $exists: true };
            }
        var data = Kurse.find({Tag: in_statement},{sort: Session.get("kurs_table_sort")});
        return data;
        }
    });

    this.route('kurs', {
        name:'kurs.show',
        template: 'Kurs',
        path: '/kurs/:_id',
        waitOn: function () {
                return Meteor.subscribe("kurse", this.params._id);
        },
        data: function (){
                Cart.remove({});
                var data = Kurs.findOne({_id: this.params._id});
                return data;
        },
        yieldTemplates: {
            'kursConfirmationModal': {to: 'footer'}
        }

    });

    this.route('kalender', {
        template: 'kursTabelle',
        path: '/kurse/:timeunit',
        waitOn: function () {
            return Meteor.subscribe("kurse");
        },
        data: function (){

                var timeunit = this.params.timeunit;
                var start = moment();
                var end = moment().add(7,'days') // default
                var in_statement = {$in: [Session.get("filter")]};

                switch (timeunit) {
                  case "day":
                    end = moment().add(1, 'days');
                    break;
                  case "week":
                        // allready set as default 7 days
                    break;
                  case "month":
                      end = moment().add(31, 'days');
                    break;
                  case "year":
                      end = moment().add(365, 'days');
                    break;
                  default:
                    // allready set as default 7 days
                    break;
                }

                if(Session.get("filter") === ""){
                    in_statement = { $exists: true };
                }

                var data = Kurse.find({Daten: {$gte: start.toDate(), $lt: end.toDate()}, Tag: in_statement },{sort: Session.get("kurs_table_sort")});



                return data;
        }

    });

    this.route('iframe', {
        template: 'kursIframe',
        layoutTemplate: 'iframe',
        path: '/iframe/:kursart/:sportart/:timeunit',
        waitOn: function () {

           var kursart = this.params.kursart;
           var sportart = this.params.sportart;


            return Meteor.subscribe("kurse", "", "", sportart, kursart );
        },
        data: function (){

                var timeunit = this.params.timeunit;
                var sportart = this.params.sportart;
                var kursart = this.params.kursart;

                var start = moment();
                var end = moment().add(365,'days'); // default
                var in_statement = {$in: [sportart]};

                switch (timeunit) {
                  case "day":
                       end = moment().add(1, 'days');
                    break;
                  case "week":
                       end = moment().add(1,'weeks');
                    break;
                  case "month":
                       end = moment().add(1, 'months');
                    break;
                 case "3months":
                       end = moment().add(3, 'months');
                    break;
                  case "year":
                       end = moment().add(1, 'years');
                    break;
                  default:
                    // allready set as default 1 year
                    break;
               }

               if( Match.test(sportart, String) ){
                   var data = Kurs.find(
                                {"Kursdaten.Stop" : { 
                                      $gte: start.toDate(), 
                                      $lte: end.toDate() 
                                   }, 
                                 "Tag": in_statement,
                                 "Art": kursart },
                                {sort: Session.get("kurs_table_sort")}
                                );
                 
                   return data;
               }
        }
    });

    this.route('kurs.edit', {
        template: 'editkurs',
        name:'kurs.edit',
        path: '/admin/kurs/:_id',
        waitOn: function () {
                return Meteor.subscribe("kurse", this.params._id);
        },
        data: function (){
                
           if (this.params._id === "create"){
              Session.set("createNewCourse", true);
              return null;
           }
           Session.set("createNewCourse", false);
           var data = Kurs.findOne({_id: this.params._id});
                //console.log(data);
                return data;
        }
    });

    this.route('admin.kurse', {
        template: 'adminkurse',
        name:'admin.kurse',
        path: '/admin/kurse',
        waitOn: function () {
                return Meteor.subscribe("kurse");
        },
        data: function (){

           if ( Session.get("showAllCourse")){
              var where = {};
           }else{
              var where = { "Activ": {$in:[true]}};
           }

           var data = Kurs.find( where,  {sort: Session.get("kurs_table_sort")});
 
                return data;
        }
    });

    this.route('admin/users', {
        template: 'Users',
        path: '/admin/users',
        onBeforeAction: function() {
            if (Meteor.loggingIn()) {
                this.render('Users');
            } else if(!Roles.userIsInRole(Meteor.user(), ['admin'])) {
                console.log('redirecting');
                this.redirect('/');
            } else {
                this.next();
            }
        },
        name:'admin.users'
    });



    this.route('admin/adressen', {
        template: 'Adressen',
        path: '/admin/adressen',
        onBeforeAction: function() {
            if (Meteor.loggingIn()) {
                this.render('Adressen');
            } else if(!Roles.userIsInRole(Meteor.user(), ['admin'])) {
                //console.log('redirecting');
                this.redirect('/');
            } else {
                this.next();
            }
        },
        name: 'admin.adressen'
    });
    this.route('admin', {
        template: 'Admin',
        yieldTemplate: {
           'new_users': {to: 'new_users'},
           'new_bookings': {to: 'new_bookings'},
           'zeiterfassung': {to: 'zeiterfassung'}
        },
        path: '/admin',
        onBeforeAction: function() {
            if (Meteor.loggingIn()) {
                this.render('Admin');
            } else if(!Roles.userIsInRole(Meteor.user(), ['admin'])) {
                //console.log('redirecting');
                this.redirect('/');
            } else {
                this.next();
            }
        },
        waitOn: function () {
                return Meteor.subscribe("kurse");
        },
        data:function (){

           var options ={"rsvp" : "exported"};
                  
           Meteor.call('anmeldungenUnwind', options, function(error, result) {

              // before we populate locale collection lets clean it!
              Kursanmeldungen.remove({});

              if(error === undefined){
                 if(result.buchungen){
                    _.each(result.buchungen, function(value, index){
                        Kursanmeldungen.insert(value);
                    });
                 }
              }

           });

           return{
                 new_bookings: Kursanmeldungen.find({}),
                 zeiterfassung:{test: "bla"}
           };
        }
    });
    this.route('coach', {
        template: 'Coach',
        path: '/coach',
        waitOn: function () {
                return Meteor.subscribe("kurse");
        },
        data: function (){
                var data = Kurs.find({ $or: [ 
                                        {"Coach": Meteor.userId()},
                                        {"Kursdaten.Daten": { $elemMatch: {"coachName":Meteor.userId()}}}
                                       ]}, {sort: {"Kursdaten.Start":-1}});

                return data;
        }

    });
    this.route('account', {
        template: 'Account',
        path: '/account',
        data: function (){

           var data = Adressen.findOne({_id: Session.get("Adress_id")});
           var userData = {};

           if ( Match.test(Session.get("user_id"), String) ){
                userData = Meteor.users.findOne({_id: Session.get("user_id") });
           } else {
                userData = Meteor.user();
           }

           if(userData && userData.profile && userData.profile.LinkedTo){
               Session.set("Adress_id",  userData.profile.LinkedTo);
           }

           return userData;

        },
        name: 'account'
   });
   this.route('kursanmeldungen', {
       path: '/admin/kursanmeldungen',
       template: 'kursanmeldungen',
       waitOn: function () {
            return Meteor.subscribe("kurse");
       },
       name: 'admin.kursanmeldungen',
       onBeforeAction: function() {
            if (! Meteor.userId()) {
                this.redirect('/sign-in');
            } else if(!Roles.userIsInRole(Meteor.user(), ['admin'])) {
                //console.log('redirecting');
                this.redirect('/');
            } else {
                this.next();
            }
        },
       data:function (){

           var options = Session.getJSON("filter_kursanmeldung");
     
           Meteor.call('anmeldungenUnwind',  options, function(error, result) {
              // before we populate locale collection lets clean it!
              Kursanmeldungen.remove({});

              if(error === undefined){
                 if(result.buchungen){
                    _.each(result.buchungen, function(value, index){
                        Kursanmeldungen.insert(value);              
                    });
                 }
                 if (result.statistik){
                    Session.set("booking_statistik", result.statistik)
                 }
              }
           });
          var data ={"buchungen": Kursanmeldungen.find({}), 
                     "statistik": Session.get("booking_statistik")  
                    };
          return data;   
       }
   }),
   this.route('bookings', {
       path: '/bookings',
       template: 'Grid_Booking',
       data:function (){

        var options = {
            "user": {"id": Meteor.userId()}
         };


         Meteor.call('anmeldungenUnwind',  options, function(error, result) {
              // before we populate locale collection lets clean it!
              Kursanmeldungen.remove({});
              if(error === undefined){
                 if(result.buchungen){
                    _.each(result.buchungen, function(value, index){
                        Kursanmeldungen.insert(value);
                    });
                 }
              }
           });
          var data ={"yes": Kursanmeldungen.find({"Rsvp":"yes"}),
                     "fakturiert": Kursanmeldungen.find({ $or: [ { Rsvp: "fakturiert" }, { Rsvp: "exported" } ] }),
                     "warteliste": Kursanmeldungen.find({"Rsvp":"warteliste"})
                    }
       return data
       }
    })
});


// Router.onBeforeAction('loading');

