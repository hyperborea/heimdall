Jobs = new Mongo.Collection('jobs');


Jobs.before.insert(function (userId, doc) {
  var user = Meteor.users.findOne(userId);

  doc.createdAt = Date.now();
  doc.ownerId = userId;
  doc.owner = user.username;
});


Jobs.allow({
  insert: function(userId, doc) {
    return true;
  },
  update: function(userId, doc, fieldNames) {
    return true;
  },
  remove: function(userId, doc) {
    return true;
  }
});