Meteor.publish('jobs', function() {
  return Jobs.find(filterByOwnership(this.userId));
});

Meteor.publish('sources', function() {
  return Sources.find({$or: [filterByOwnership(this.userId), { isPublic: true }]}, {
    fields: { password: 0 }
  });
});