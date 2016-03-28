Visualizations = new Mongo.Collection('visualizations');

Meteor.startup(function() {
  if (!Meteor.isServer) return;
  Visualizations._ensureIndex({ jobId: 1 });
});


Visualizations.helpers({
  job: function() {
    return Jobs.findOne(this.jobId);
  }
});


Meteor.methods({
  addVisualization: function(jobId) {
    const user = Meteor.users.findOne(this.userId);
    const job = Jobs.findOne(jobId);
    requireOwnership(user, job);

    _id = Visualizations.insert({
      title : job.name,
      jobId : job._id,
      type  : 'DataTable'
    });

    return _id;
  },

  saveVisualization: function(doc) {
    var vis = Visualizations.findOne(doc._id);
    requireOwnership(this.userId, vis.job());

    doc.jobId = vis.jobId;
    Visualizations.update(doc._id, doc);
  },

  removeVisualization: function(_id) {
    requireOwnership(this.userId, Visualizations.findOne(_id).job());

    Visualizations.remove(_id);
  }
});