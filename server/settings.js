_.extend(LDAP_SETTINGS, {
  allowedGroups: [
    'risk',
    'risk.e',
    'product',
    'dispute.resolutions.mgmt',
    'management',
    'us.leadership',
    'workforce.management',
    'finance',
    'heimdall.debug'
  ],
  
  roleMapping: {
    admin: ['risk.infrastructure']
  },

  guestUser: {
    username: 'guest',
    password: 'guest',
    displayName: 'Guest User',
    groups: ['heimdall.debug'],
  }
});