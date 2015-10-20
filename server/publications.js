Meteor.publish('jobs', function() {
  return Jobs.find();
});