Visualizations = new Mongo.Collection('visualizations');

Meteor.startup(function() {
  if (!Meteor.isServer) return;
  Visualizations._ensureIndex({ jobId: 1 });
});


Visualizations.helpers({
  job: function() {
    return Jobs.findOne(this.jobId);
  },
  
  result: function(parameters) {
    const job = this.job() || {};
    parameters = parameters || this.parameters || {};
    parameters = cleanParameters(parameters, job.parameters);
    return JobResults.findOne({ jobId: this.jobId, parameters: parameters });
  },
});


Meteor.methods({
  addVisualization: function(jobId) {
    const user = Meteor.users.findOne(this.userId);
    const job = Jobs.findOne(jobId);
    requireOwnership(user, job);

    _id = Visualizations.insert({
      title   : job.name,
      type    : 'DataTable',
      jobId   : job._id,
    });

    syncVisualization(_id, job);

    return _id;
  },

  saveVisualization: function(doc) {
    var vis = Visualizations.findOne(doc._id);
    requireOwnership(this.userId, vis.job());

    Visualizations.update(doc._id, { $set: _.omit(doc, '_id') });
  },

  removeVisualization: function(_id) {
    requireOwnership(this.userId, Visualizations.findOne(_id).job());

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