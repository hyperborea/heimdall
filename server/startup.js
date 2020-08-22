// Start up scheduling
Meteor.startup(function () {
  // only run cronjobs on master node if using multicore clustering
  if (!process.env.CLUSTER_WORKER_ID) {
    SyncedCron.stop();
    SyncedCron.start();

    // mark previously running jobs as zombies
    Jobs.update(
      { status: "running" },
      { $set: { status: "zombie" } },
      { multi: true }
    );

    // reschedule jobs
    Jobs.find({ schedule: { $ne: "" } }).forEach((job) => {
      scheduleJob(job._id, job.schedule);
    });

    Jobs.find({ status: "zombie" }).forEach((job) => {
      console.warn(`Rerunning zombie job "${job._id}"`);
      runJob(job._id);
    });
  }
});
