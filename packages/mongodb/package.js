Package.describe({
  summary: "MongoDB",
  version: "1.4.25",
});

Npm.depends({mongodb: "1.4.25"});

Package.on_use(function (api) {

    if (api.export) // ensure backwards compatibility with Meteor pre-0.6.5
        api.export('MongoDB');
        
    api.add_files("mongodb.js", "server");
});
