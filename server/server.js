Meteor.startup(function() {
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
});


// Keep track of all users LDAP roles and ensure profile.
Accounts.onLogin(function() {
  var user = Meteor.user();
  var existingGroups = Groups.find().fetch();

  var newGroupNames = _.difference(user.groups, _.pluck(existingGroups, 'name'));
  _.each(newGroupNames, function(groupName) {
    Groups.insert({ name: groupName });
  });

  if (!user.hasOwnProperty('profile')) {
    Meteor.users.update(user._id, { $set: { profile: {} } });
  }
});