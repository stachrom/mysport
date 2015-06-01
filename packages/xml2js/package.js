Package.describe({
  summary: "Simple XML to JavaScript object converter",
  version: "0.4.8",
});

Npm.depends({xml2js: "0.4.8"});

Package.on_use(function (api) {
  if (api.export) // ensure backwards compatibility with Meteor pre-0.6.5
    api.export('XML2JS');
  api.add_files("xml2js.js", "server");
});


