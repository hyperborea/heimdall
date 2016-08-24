Dashboards = new Mongo.Collection('dashboards');


Dashboards.before.insert(function(userId, doc) {
  var user = Meteor.users.findOne(userId);

  doc.createdAt = new Date();
  doc.ownerId = userId;
  doc.owner = user.username;
});


Dashboards.allow({
  insert: function(userId, doc) {
    return isUser(userId);
  },
  update: function(userId, doc, fieldNames) {
    return isOwner(userId, doc) && (!_.contains(['owner', 'ownerId', 'createdAt'], fieldNames));
  },
  remove: function(userId, doc) {
    return isOwner(userId, doc);
  }
});