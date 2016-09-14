Meteor.publish('dashboards', function(filter, limit) {
  filter = { $and: [filter || {}, filterByAccess(this.userId)] };

  return Dashboards.find(filter, {
    fields : { title: 1, owner: 1, ownerId: 1, tags: 1, description: 1 },
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

Meteor.publish('dashboard', function(_id) {
  return Dashboards.find({ $and: [filterByAccess(this.userId), { _id: _id }] });
});

Meteor.publishComposite('dashboardForm', function(_id) {
  return {
    find: function() {
      return Dashboards.find({ $and: [filterByAccess(this.userId), { _id: _id }] });
    },
    children: [{
      find: function(dashboard) {
        return Visualizations.find({ _id: { $in: _.pluck(dashboard.widgets, 'visId') } }, {
          fields: { title: 1, jobName: 1, owner: 1 }
        });
      }
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

Meteor.publishComposite('job', function(_id) {
  return {
    find: function() {
      return Jobs.find({ $and: [filterByAccess(this.userId), { _id: _id }] });
    },
    children: [{
      find: (job) => JobResults.find({ jobId: job._id, parameters: job.parameters })
    }, {
      find: (job) => Visualizations.find({ jobId: job._id }, { fields: { jobId: 1, title: 1 } })
    }]
  }
});

Meteor.publish('visualizationsDropdown', function(includeNonOwned=false, search='', limit=10) {
  var accessFilter = includeNonOwned ? filterByAccess(this.userId) : filterByOwnership(this.userId);
  var searchFilter = {$or: [
    { title   : { $regex: search, $options: 'i' } },
    { jobName : { $regex: search, $options: 'i' } },
  ]};

  return Visualizations.find({ $and: [accessFilter, searchFilter] }, {
    fields : { title: 1, jobName: 1, owner: 1 },
    limit  : limit,
  })
});

Meteor.publish('visualization', function(_id, parameters, dashboardId=false) {
  const vis = Visualizations.findOne(_id);
  if (!vis) return null;

  // visualizations may either be accessed through dashboards or directly
  if (dashboardId) {
    const dashboard = Dashboards.findOne(dashboardId);
    if (!_.contains(_.pluck(dashboard.widgets, 'visId'), _id)) {
      throw new Meteor.Error('access-denied', `Visualization ${_id} is not in dashboard ${dashboardId}`);
    } else {
      requireAccess(this.userId, dashboard);  
    }
  } else {
    requireAccess(this.userId, vis);
  }

  parameters = cleanParameters(parameters, vis.job().parameters);
  
  // run job if at time of subscription there are no results for these parameters or the cache has expired
  const results = JobResults.findOne({ jobId: vis.jobId, parameters: parameters });
  if (!results || (results.expiresAt < new Date() && results.status !== 'running')) {
    runJob(vis.jobId, parameters);  
  }

  return [
    Visualizations.find(_id),
    Jobs.find(vis.jobId, { fields: { name: 1, parameters: 1 } }),
    JobResults.find({ jobId: vis.jobId, parameters: parameters }),
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
    fields : { name: 1, owner: 1, ownerId: 1, type: 1, 'test.status': 1 },
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