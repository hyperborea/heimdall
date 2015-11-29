Meteor.publish('dashboards', function() {
  return Dashboards.find(filterByAccess(this.userId), {
    fields : { title: 1, owner: 1 },
    sort   : { name: 1 }
  });
});

Meteor.publish('dashboard', function(_id) {
  return Dashboards.find({$and: [filterByAccess(this.userId), { _id: _id }]});
});


Meteor.publish('jobs', function() {
  return Jobs.find(filterByAccess(this.userId), {
    fields : { name: 1, owner: 1, createdAt: 1 },
    sort   : { name: 1 }
  });
});

Meteor.publish('job', function(_id) {
  return Jobs.find({$and: [filterByAccess(this.userId), { _id: _id }]});
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