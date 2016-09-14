Meteor.startup(function() {
  if (process.env.NODE_ENV === 'production') {
    Migrations.migrateTo('latest');
  }
});


Migrations.add({
  version: 5,
  name: 'Adding cache expiration to jobs and job results',
  up() {
    const defaultDuration = 2628000;
    Jobs.update({cacheDuration: {$exists: false}}, {$set: {cacheDuration: defaultDuration}}, {multi: true, validate: false});
    JobResults.find({expiresAt: {$exists: false}}).forEach((res) => {
      var expiresAt = moment(res.updatedAt).add(defaultDuration, 'seconds').toDate();
      JobResults.update(res._id, {$set: {expiresAt: expiresAt}}, {validate: false});
    });
  },
  down() {}
});

Migrations.add({
  version: 4,
  name: 'Wrapping visualization settings for cleaner schema',
  up() {
    Visualizations.find().forEach((vis) => {
      const coreFields = Visualizations.simpleSchema().objectKeys();
      const settingsFields = _.without(Object.keys(vis), ...coreFields, '_id');
      const settings = _.pick(vis, settingsFields);

      Visualizations.update(vis._id, {
        $set: {settings: settings},
        $unset: _.object(settingsFields, _.range(settingsFields.length)),
      }, {validate: false});
    });
  },
  down() {
    Visualizations.find().forEach((vis) => {
      if (vis.settings) {
        Visualizations.update(vis._id, {
          $set: vis.settings,
          $unset: {settings: 1},
        }, {validate: false, filter: false});
      }
    });
  }
});

Migrations.add({
  version: 3,
  name: 'Adds parameters to job results',
  up() {
    Jobs.update({parameters: {$exists: false}}, {$set: {parameters: Object()}}, {multi: true, validate: false});
    JobResults.update({parameters: {$exists: false}}, {$set: {parameters: Object()}}, {multi: true, validate: false});
  },
  down() {}
});

Migrations.add({
  version: 2,
  name: 'Breaks out job results into its own collection',
  up() {
    Jobs.find().forEach((job) => {
      if (job.result && job.result.status) {
        var data = _.extend(job.result, {jobId: job._id});
        JobResults.upsert({jobId: job._id}, {$set: data}, {validate: false});
        Jobs.update(job._id, {$unset: {result: ''}}, {validate: false});
      }
    });
  },
  down() {
    JobResults.find().forEach((result) => {
      Jobs.update(result.jobId, {$set: {result: result}}, {validate: false});
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