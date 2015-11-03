Meteor.startup(function() {
  SyncedCron.start();

  Jobs.find({schedule: {$ne: ''}}).forEach((job) => {
    scheduleJob(job._id, job.schedule);
  });
});


// SSL should be handled by nginx eventually, but for now nourharidy:ssl should do the trick.
// As port 443 requires root permissions I'm only activating the SSL proxy server for the root user.
if (process.env.USER === 'root') {
  const basePath = process.env.PWD;
  SSL(`${basePath}/private/server.key`,`${basePath}/private/server.crt`, 443);
}
