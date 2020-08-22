Meteor.users.helpers({
  userIcon: function () {
    return this.profile.icon || "user";
  },
});

Meteor.methods({
  createUserWithRandomPassword: function (username) {
    requireAdmin(this.userId);

    const password = Random.secret(8);
    Accounts.createUser({
      username: username,
      password: password,
    });
    return password;
  },

  resetUserPassword: function (userId) {
    requireAdmin(this.userId);

    const password = Random.secret(8);
    Accounts.setPassword(userId, password);
    return password;
  },

  updateProfile: function (userId, profile) {
    if (this.userId !== userId) requireAdmin(this.userId);
    const user = Meteor.users.findOne(userId);
    profile = _.defaults(profile, user.profile);
    Meteor.users.update(userId, { $set: { profile: profile } });
  },

  updateUserGroups: function (userId, groups) {
    requireAdmin(this.userId);
    Meteor.users.update(userId, { $set: { groups: groups } });

    var existingGroups = Groups.find().fetch();
    var newGroupNames = _.difference(groups, _.pluck(existingGroups, "name"));
    _.each(newGroupNames, function (groupName) {
      Groups.insert({ name: groupName });
    });
  },

  deleteUser: function (userId) {
    requireAdmin(this.userId);
    Meteor.users.remove(userId);
  },
});
