if (typeof Meteor.settings === 'undefined')
  Meteor.settings = {};

_.defaults(Meteor.settings, {
  google: {
    clientId: "915248114134-5vf5cm77n16usessg8odvm224hmlrta8.apps.googleusercontent.com", 
    secret: "Q8JbqeuXzX8HTBRuZMIpACz1"
  },
  facebook: {
    appId: "125386384464818",
    secret: "28c63073f901a6171d5ddb2b5f06989d"
  },
  twitter: {
     consumerKey: "nDFmOSJd9V45rC1FuIS2wjy15",
     secret: "G9VOhOkMzK7V7QLlfwqKCI3pNhQFW6EuoQ1LIcsTWLEADIAbr7"
  }
});

ServiceConfiguration.configurations.upsert(
  { service: "google" },
  {
    $set: {
      clientId: Meteor.settings.google.clientId,
      secret: Meteor.settings.google.secret
    }
  }
);

ServiceConfiguration.configurations.upsert(
  { service: "twitter" },
  { 
    $set: {
      consumerKey: Meteor.settings.twitter.consumerKey,
      secret: Meteor.settings.twitter.secret
    } 
  }
);
ServiceConfiguration.configurations.upsert(
  { service: "facebook" },
  { 
    $set: {
      appId: Meteor.settings.facebook.appId,
      secret: Meteor.settings.facebook.secret
    } 
  } 
);


