Meteor.publish('dashboards', function() {
  return Dashboards.find(filterByAccess(this.userId), {
    fields : { title: 1, owner: 1 },
    sort   : { name: 1 }
  });
});

Meteor.publishComposite('dashboard', function(_id) {
  return {
    find: function() {
      return Dashboards.find({ $and: [filterByAccess(this.userId), { _id: _id }] });
    },
    children: [{
      find: function(dashboard) {
        const jobIds = _.map(dashboard.widgets, (w) => w.jobId );
        return Jobs.find({ _id: { $in: jobIds } });
      }
    }]
  };
});


Meteor.publish('jobs', function() {
  return Jobs.find(filterByAccess(this.userId), {
    fields : { name: 1, owner: 1, ownerId: 1, createdAt: 1, schedule: 1, status: 1, alarmStatus: 1 },
    sort   : { name: 1 }
  });
});

Meteor.publish('job', function(_id) {
  return Jobs.find({$and: [filterByAccess(this.userId), { _id: _id }]});
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


Meteor.publish('sources', function() {
  return Sources.find(filterByAccess(this.userId), {
    fields : { password: 0 },
    sort   : { name: 1 }
  });
});


Meteor.publish('groups', function() {
  return Groups.find({}, {
    sort: { name: 1 }
  });
});