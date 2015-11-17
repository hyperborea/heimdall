Meteor.publish('dashboards', function() {
  // filterByOwnership(this.userId)
  return Dashboards.find({}, {
    fields: { title: 1, owner: 1 }
  });
});

Meteor.publish('dashboard', function(_id) {
  // return Dashboards.find({$and: [filterByOwnership(this.userId), { _id: _id }]});
  return Dashboards.find(_id);
});


Meteor.publish('jobs', function() {
  return Jobs.find(filterByOwnership(this.userId), {
    fields: { name: 1, owner: 1, createdAt: 1 }
  });
});

Meteor.publish('job', function(_id) {
  return Jobs.find({$and: [filterByOwnership(this.userId), { _id: _id }]});
});


Meteor.publish('sources', function() {
  return Sources.find({$or: [filterByOwnership(this.userId), { isPublic: true }]}, {
    fields: { password: 0 }
  });
});