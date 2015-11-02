Meteor.startup(function() {
  SyncedCron.start();

  Jobs.find({schedule: {$ne: ''}}).forEach((job) => {
    scheduleJob(job._id, job.schedule);
  });
});


if (process.env.USER === 'root') {
  const basePath = process.env.PWD;
  SSL(`${basePath}/private/server.key`,`${basePath}/private/server.crt`, 443);
}
