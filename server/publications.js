Meteor.publish('jobs', function() {
  return Jobs.find(filterByOwnership(this.userId));
});

Meteor.publish('sources', function() {
  return Sources.find(filterByOwnership(this.userId), {
    fields: { password: 0 }
  });
});