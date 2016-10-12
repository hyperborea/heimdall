Visualizations = new Mongo.Collection('visualizations');

Visualizations.schema = new SimpleSchema({
  title: String,
  type: String,
  jobId: { type: String, regEx: SimpleSchema.RegEx.Id, index: 1 },
  jobName: String,
  settings: { type: Object, blackbox: true, defaultValue: Object() }
});

Visualizations.schema.extend(permissionSchema); // synced from job
Visualizations.attachSchema(Visualizations.schema);


Visualizations.helpers({
  job: function() {
    return Jobs.findOne(this.jobId);
  },
  
  result: function(parameters) {
    const job = this.job() || {};
    parameters = parameters || this.parameters || {};
    parameters = cleanParameters(parameters, job.parameters);
    return JobResults.findOne({ jobId: this.jobId, parameters: parameters });
  }
});


Meteor.methods({
  addVisualization: function(jobId) {
    const user = Meteor.users.findOne(this.userId);
    const job = Jobs.findOne(jobId);
    requireOwnership(user, job);

    _id = Visualizations.insert({
      title        : job.name,
      type         : 'DataTable',
      jobId        : job._id,
      jobName      : job.name,
      ownerGroups  : job.ownerGroups,
      accessGroups : job.accessGroups,
      owner        : job.owner,
      ownerId      : job.ownerId,
    });

    return _id;
  },

  saveVisualization: function(doc) {
    var vis = Visualizations.findOne(doc._id);
    requireOwnership(this.userId, vis);

    Visualizations.update(doc._id, { $set: doc });
  },

  cloneVisualization: function(visId) {
    var vis = Visualizations.findOne(visId);
    requireOwnership(this.userId, vis);

    delete vis._id;
    vis.title = vis.title + ' - CLONE';
    return Visualizations.insert(vis);
  },

  removeVisualization: function(_id) {
    requireOwnership(this.userId, Visualizations.findOne(_id));

    Visualizations.remove(_id);
  }
});


syncVisualization = function(_id, job) {
  var jobData = {
    jobName: job.name,
    ownerGroups: job.ownerGroups,
    accessGroups: job.accessGroups,
  };

  if (job.hasOwnProperty('owner'))
    jobData.owner = job.owner;
  if (job.hasOwnProperty('ownerId'))
    jobData.ownerId = job.ownerId;

  Visualizations.update(_id, { $set: jobData });
};