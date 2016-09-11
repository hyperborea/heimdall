Meteor.startup(function() {
  if (process.env.NODE_ENV === 'production') {
    Migrations.migrateTo('latest');
  }
});


Migrations.add({
  version: 3,
  name: 'Adds parameters to job results',
  up() {
    JobResults.update({parameters: {$exists: false}}, {$set: {parameters: Object()}}, {multi: true});
  },
  down() {}
});

Migrations.add({
  version: 2,
  name: 'Breaks out job results into its own collection',
  up() {
    Jobs.find().forEach((job) => {
      if (job.result && job.result.status) {
        var data = _.extend(job.result, {jobId: job._id, parameters: Object()});
        JobResults.upsert({jobId: job._id}, {$set: data});
        Jobs.update(job._id, {$unset: {result: ''}});
      }
    });
  },
  down() {
    JobResults.find().forEach((result) => {
      Jobs.update(result.jobId, {$set: {result: result}});
      JobResults.remove(result._id);
    });
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