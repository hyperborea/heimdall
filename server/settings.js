LDAP_SETTINGS.roleMapping = {
  admin: ['risk.infrastructure']
};

LDAP_SETTINGS.guestUser = {
  username: 'guest',
  password: 'guest',
  displayName: 'Guest User',
  // groups: ['risk.infrastructure']
};

Meteor.startup(function () {
  process.env.MAIL_URL = 'smtp://postmaster%40sandbox8603df9709384ac0b9d27e27d846fbae.mailgun.org:7ef57afe56e38ed80c13c95fa3eb00aa@smtp.mailgun.org:587';
});