Meteor.startup(function() {
  if (process.env.NODE_ENV === 'production') {
    Migrations.migrateTo('latest');
  }
});


Migrations.add({
  version: 1,
  name: 'Denormalizes visualizations by pulling in the jobName and access control fields',
  up() {
    Jobs.find().forEach((job) => {
      Visualizations.update({ jobId: job._id }, { $set: {
          jobName      : job.name,
          owner        : job.owner,
          ownerId      : job.ownerId,
          ownerGroups  : job.ownerGroups,
          accessGroups : job.accessGroups,
        }}, { multi: true });
    });
  },
  down() {
    Jobs.find().forEach((job) => {
      Visualizations.update(
        { },
        { $unset: { jobName: '', owner: '', ownerId: '', ownerGroups: '', accessGroups: '' } },
        { multi: true });
    });
  }
});