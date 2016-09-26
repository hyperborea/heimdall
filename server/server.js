import { startCase } from 'lodash';


_.defaults(Meteor.settings, {
  services: []
});

_.extend(LDAP_SETTINGS, Meteor.settings.ldap);

ServiceConfiguration.configurations.remove({});
Meteor.settings.services.forEach((config) => {
  ServiceConfiguration.configurations.insert(config);
});

Accounts.config({
  forbidClientAccountCreation: true,
  // restrictCreationByEmailDomain: 'klarna.com'
});

// Ensure there's an admin account
Meteor.startup(function() {
  let adminUser = Accounts.findUserByUsername('admin');

  if (!adminUser) {
    adminUser = Accounts.createUser({
      username: 'admin',
      password: 'admin'
    });
  }
  
  Roles.addUsersToRoles(adminUser, 'admin');
});


// Start uo scheduling, TODO: split out of auth related code
Meteor.startup(function() {
  // only run cronjobs on master node if using multicore clustering
  if (!process.env.CLUSTER_WORKER_ID) {
    SyncedCron.start();

    // mark previously running jobs as zombies
    Jobs.update({status: 'running'}, {$set: {status: 'zombie'}}, {multi: true});

    // reschedule jobs
    Jobs.find({schedule: {$ne: ''}}).forEach((job) => {
      scheduleJob(job._id, job.schedule);
    });

    Jobs.find({status: 'zombie'}).forEach((job) => {
      console.warn(`Rerunning zombie job "${job._id}"`);
      runJob(job._id);
    });
  }
});


// Keep track of all LDAP groups
Accounts.onLogin(function() {
  var user = Meteor.user();
  var existingGroups = Groups.find().fetch();

  var newGroupNames = _.difference(user.groups, _.pluck(existingGroups, 'name'));
  _.each(newGroupNames, function(groupName) {
    Groups.insert({ name: groupName });
  });
});


Accounts.onCreateUser(function(options, user) {
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

  return _.defaults(user, {
    profile: {},
    groups: [],
    displayName: startCase(user.username),
  });
});