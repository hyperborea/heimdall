Meteor.publish('dashboards', function() {
  return Dashboards.find(filterByAccess(this.userId), {
    fields : { title: 1, owner: 1, ownerId: 1, tags: 1 },
    sort   : { title: 1 }
  });
});

Meteor.publishComposite('dashboard', function(_id) {
  return {
    find: function() {
      return Dashboards.find({ $and: [filterByAccess(this.userId), { _id: _id }] });
    },
    children: [{
      find: function(dashboard) {
        return Visualizations.find({ _id: { $in: _.pluck(dashboard.widgets, 'visId') } });
      },
      children: [{
        find: (vis) => Jobs.find(vis.jobId)
      }]
    }]
  };
});

Meteor.publishComposite('dashboardForm', function(_id) {
  return {
    find: function() {
      return Dashboards.find({ $and: [filterByAccess(this.userId), { _id: _id }] });
    },
    children: [{
      find: function(dashboard) {
        return Visualizations.find({ _id: { $in: _.pluck(dashboard.widgets, 'visId') } }, {
          fields: { title: 1, jobId: 1 }
        });
      },
      children: [{
        find: (vis) => Jobs.find(vis.jobId, { fields: { name: 1, owner: 1 } })
      }]
    }]
  };
});


Meteor.publish('jobs', function() {
  return Jobs.find(filterByAccess(this.userId), {
    fields : { name: 1, owner: 1, ownerId: 1, createdAt: 1, schedule: 1, status: 1, alarmStatus: 1 }
  });
});

Meteor.publish('job', function(_id) {
  requireAccess(this.userId, Jobs.findOne(_id));

  return [
    Jobs.find(_id),
    Visualizations.find({ jobId: _id })
  ];
});

Meteor.publishComposite('visualizations', function() {
  return {
    find: () => Jobs.find(filterByAccess(this.userId), { fields: { name: 1, owner: 1 } }),
    children: [{
      find: (job) => Visualizations.find({ jobId: job._id })
    }]
  }
});

Meteor.publish('visualization', function(_id) {
  const vis = Visualizations.findOne(_id);
  requireAccess(this.userId, vis.job());

  return [
    Visualizations.find(_id),
    Jobs.find(vis.jobId)
  ];
});

Meteor.publishComposite('jobAlarms', function(options) {
  _.defaults(options, {
    showAck: false,
  });

  return {
    find: function() {
      return Jobs.find(filterByAccess(this.userId), { fields: { name: 1 } });
    },
    children: [{
      find: function(job) {
        return JobAlarms.find({
          jobId: job._id,
          status: options.showAck ? { $in: ['open', 'ack'] } : 'open'
        });
      }
    }]
  };
});

Meteor.publish('jobAlarmsForRun', function(jobId, runId) {
  requireAccess(this.userId, Jobs.findOne(jobId));

  return [
    JobAlarms.find({ jobId: jobId, runId: runId }),
    Jobs.find(jobId, { fields: { name: 1 } })
  ];
})


Meteor.publish('sources', function() {
  return Sources.find(filterByAccess(this.userId), {
    fields : { password: 0 }
  });
});


Meteor.publish('groups', function() {
  return Groups.find();
});