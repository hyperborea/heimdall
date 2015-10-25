Meteor.publish('jobs', function() {
  return Jobs.find();
});

Meteor.publish('sources', function() {
  return Sources.find({
    // ownerId: this.userId
  }, {
    fields: { password: 0 }
  });
});