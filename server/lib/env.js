Meteor.startup(function () {
  process.env.MAIL_URL = 'smtp://postmaster%40stachura.ch:goanna@192.168.1.2:465';
});
