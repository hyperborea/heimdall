Meteor.publish('dashboards', function(filter, limit) {
  filter = { $and: [filter || {}, filterByAccess(this.userId)] };

  return Dashboards.find(filter, {
    fields : { title: 1, owner: 1, ownerId: 1, tags: 1 },
    sort   : { title: 1 },
    limit  : limit,
  });
});

Meteor.publish('favoriteDashboards', function() {
  requireUser(this.userId);
  var favorites = getStarred('dashboard', this.userId);
  var filter = { $and: [{ _id: { $in: favorites } }, filterByAccess(this.userId)] };

  return Dashboards.find(filter, {
    fields : { title: 1, owner: 1, ownerId: 1, tags: 1 },
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

Meteor.publish('jobs', function(filter, limit) {
  filter = { $and: [filter || {}, filterByAccess(this.userId)] };

  return Jobs.find(filter, {
    fields : { name: 1, owner: 1, ownerId: 1, createdAt: 1, schedule: 1, status: 1, alarmStatus: 1 },
    sort   : { createdAt: -1 },
    limit  : limit,
  })
});

Meteor.publish('job', function(_id) {
  requireAccess(this.userId, Jobs.findOne(_id));

  return [
    Jobs.find(_id),
    Visualizations.find({ jobId: _id })
  ];
});

Meteor.publishComposite('visualizations', function(includeNonOwned=false) {
  return {
    find: () => {
      // this.visCounter = 0;
      var filter = includeNonOwned ? filterByAccess(this.userId) : filterByOwnership(this.userId);
      return Jobs.find(filter, { fields: { name: 1, owner: 1 } });
    },
    children: [{
      find: (job) => {
        // if (++this.visCounter > limit) return;
        return Visualizations.find({ jobId: job._id }, { fields: { title: 1, jobId: 1 } });
      }
    }]
  };
});

Meteor.publish('visualization', function(_id) {
  const vis = Visualizations.findOne(_id);
  requireAccess(this.userId, vis.job());

  return [
    Visualizations.find(_id),
    Jobs.find(vis.jobId)
  ];
});

Meteor.publishComposite('jobAlarms', function(options={}) {
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
        }, {
          limit: 100
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

Meteor.publish('sources', function(filter, limit) {
  filter = { $and: [filter || {}, filterByAccess(this.userId)] };

  return Sources.find(filter, {
    fields : { name: 1, owner: 1, ownerId: 1, username: 1 },
    limit  : limit
  });
});

Meteor.publish('source', function(_id) {
  requireAccess(this.userId, Sources.findOne(_id));
  return Sources.find(_id, { fields : { password: 0 } });
});

Meteor.publish('groups', function(search='', limit=10) {
  var filter = {};
  if (search) filter['name'] = { $regex: search };

  return Groups.find(filter, { limit: limit });
});

Meteor.publish('events', function() {
  requireUser(this.userId);
  return Events.find();
});

Meteor.publish('tags', function(type) {
  requireUser(this.userId);
  return Tags.find({ type: type });
});