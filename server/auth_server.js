import _ from "lodash";

_.defaults(Meteor.settings, { services: [] });
_.extend(LDAP_SETTINGS, Meteor.settings.ldap);

ServiceConfiguration.configurations.remove({});
Meteor.settings.services.forEach(config => {
  ServiceConfiguration.configurations.insert(config);
});

Accounts.config({
  forbidClientAccountCreation: true,
  restrictCreationByEmailDomain: Meteor.settings.restrictEmailDomain
});

// Ensure there's an admin account
Meteor.startup(function() {
  let adminUser = Accounts.findUserByUsername("admin");

  if (!adminUser) {
    adminUser = Accounts.createUser({
      username: "admin",
      password: "admin"
    });
  }

  Roles.addUsersToRoles(adminUser, "admin");
});

// Keep track of all LDAP groups
Accounts.onLogin(function() {
  var user = Meteor.user();
  var existingGroups = Groups.find().fetch();

  var newGroupNames = _.difference(user.groups, _.map(existingGroups, "name"));
  _.each(newGroupNames, function(groupName) {
    Groups.insert({ name: groupName });
  });
});

Accounts.onCreateUser(function(_options, user) {
  if (user.services.google) {
    user.username = user.services.google.email;
    user.displayName = user.services.google.name;
  }
  if (user.services.github) {
    user.username = user.services.github.username;
  }
  if (user.services.facebook) {
    user.username = user.services.facebook.email;
    user.displayName = user.services.facebook.name;
  }

  // Default user groups may be defined as an array or an Object of shape { regex: [groups] }
  const spec = Meteor.settings.defaultGroups;
  let defaultGroups;
  if (Array.isArray(spec)) {
    defaultGroups = spec;
  } else if (_.isPlainObject(spec)) {
    defaultGroups = _.find(spec, (_groups, regex) =>
      user.username.match(regex)
    );
  }

  return _.defaults(user, {
    profile: {},
    groups: defaultGroups || [],
    displayName: user.username
  });
});
