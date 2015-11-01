Meteor.startup(function() {
  SyncedCron.start();

  Jobs.find({schedule: {$ne: ''}}).forEach((job) => {
    scheduleJob(job._id, job.schedule);
  });
});