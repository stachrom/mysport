
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
            return Meteor.subscribe("kurseErweitert");
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
        template: 'Kurs',
        path: '/kurs/:_id',
        waitOn: function () {
                return Meteor.subscribe("kurseErweitert", this.params._id);
        },
        data: function (){
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
            return Meteor.subscribe("kurseErweitert");
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


            return Meteor.subscribe("kurseErweitert", "", "", sportart, kursart );
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
        path: '/admin'
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

   this.route('bookings', {
       path: '/bookings',
       waitOn: function () {
                return Meteor.subscribe("kurseErweitert");
       },
       template: 'Bookings',
       data:function (){

           var whereClause = {rsvps : {$elemMatch : { user: Meteor.userId() } } };
           var my_kurse = Kurs.find(whereClause);

           var booked = my_kurse.fetch();
           // show only users booking. 
           for(i = 0; booked.length > i; i++ ){

               var my_order = _.find(booked[i].rsvps, function(doc){
                     return doc.user === Meteor.userId();
               });

              //console.log(my_order.price);
              _.extend(booked[i], {Price: my_order.price });
              _.extend(booked[i], {Date: my_order.date });
              _.extend(booked[i], {rsvp: my_order.rsvp });

           }
           return booked;
       },
       name: 'bookings'

    })
});


// Router.onBeforeAction('loading');
