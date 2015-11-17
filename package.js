//This is for Meteor JS Platform.
Package.describe({
  name: 'nodets:mysql',
  version: '2.8.2',
  // Brief, one-line summary of the package.
  summary: 'This is a meteor package which brings strong and easy way in order to write apps using Mysql.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/nodets/meteor-mysql',
  documentation: 'README.md'
});

Npm.depends({
  'node-mysql-wrapper': "2.8.2",
  'meteor-mysql': "2.8.2"
});

Package.onUse(function(api) {
 // api.versionsFrom('1.2.0.2');
  api.versionsFrom("1");
  api.use('ecmascript@0.1.5');

  api.addFiles('compiled/lib/MeteorServerSide.js','server');
  api.export(['Mysql']);
});
