import _ from "lodash";
import { google } from "googleapis";

_.defaults(Meteor.settings, { services: [] });
_.extend(LDAP_SETTINGS, Meteor.settings.ldap);

ServiceConfiguration.configurations.remove({});
Meteor.settings.services.forEach((config) => {
  ServiceConfiguration.configurations.insert(config);
});

Accounts.config({
  forbidClientAccountCreation: true,
  restrictCreationByEmailDomain: Meteor.settings.restrictEmailDomain,
});

// Ensure there's an admin account
Meteor.startup(function () {
  let adminUser = Accounts.findUserByUsername("admin");

  if (!adminUser) {
    adminUser = Accounts.createUser({
      username: "admin",
      password: "admin",
      email: Meteor.settings.restrictEmailDomain
        ? `heimdall-admin@${Meteor.settings.restrictEmailDomain}`
        : undefined,
    });
  }

  Roles.addUsersToRoles(adminUser, "admin");
});

// Sync user groups if specifically enabled or if using LDAP.
Accounts.onLogin(function () {
  const user = Meteor.user();

  if (Meteor.settings.syncGoogleGroups) {
    if (
      user.services.google &&
      (!user.lastSyncedExpiresAt ||
        user.services.google.expiresAt > user.lastSyncedExpiresAt)
    ) {
      // Need to impersonate a user with access to Directory API using service account with domain-wide delegation:
      // https://medium.com/swlh/how-to-use-directory-from-google-api-using-node-js-cb375f7a3f14
      // https://developers.google.com/admin-sdk/directory/v1/guides/delegation
      const auth = new google.auth.JWT(
        Meteor.settings.syncGoogleGroups.clientEmail,
        null,
        Meteor.settings.syncGoogleGroups.privateKey,
        ["https://www.googleapis.com/auth/admin.directory.group.readonly"],
        Meteor.settings.syncGoogleGroups.impersonateEmail
      );
      const directory = google.admin({ version: "directory_v1", auth });

      const { email } = user.services.google;
      directory.groups.list({ userKey: email }).then((response) => {
        user.groups = (response.data.groups || []).map((item) =>
          item.email.substring(0, item.email.indexOf("@"))
        );
        Meteor.users.update(user._id, {
          $set: {
            groups: user.groups,
            lastSyncedExpiresAt: user.services.google.expiresAt,
          },
        });
      });
    }
  }

  var existingGroups = Groups.find().fetch();
  var newGroupNames = _.difference(user.groups, _.map(existingGroups, "name"));
  _.each(newGroupNames, function (groupName) {
    Groups.insert({ name: groupName });
  });
});

Accounts.onCreateUser(function (_options, user) {
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
    displayName: user.username,
  });
});
