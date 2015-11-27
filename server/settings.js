_.extend(LDAP_SETTINGS, {
  allowedGroups: ['risk', 'risk.management', 'riskengineering.tl.e', 'product'],
  
  roleMapping: {
    admin: ['risk.infrastructure']
  },

  guestUser: {
    username: 'guest',
    password: 'guest',
    displayName: 'Guest User',
    groups: ['guest'],
  }
});

// Meteor.startup(function () {
//   process.env.MAIL_URL = 'smtp://postmaster%40sandbox8603df9709384ac0b9d27e27d846fbae.mailgun.org:7ef57afe56e38ed80c13c95fa3eb00aa@smtp.mailgun.org:587';
// });