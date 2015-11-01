Sources = new Mongo.Collection('sources');


Sources.before.insert(function (userId, doc) {
  var user = Meteor.users.findOne(userId);

  doc.createdAt = Date.now();
  doc.ownerId = userId;
  doc.owner = user.username;

  if (!doc.port) doc.port = '5432';
  if (!doc.name) doc.name = doc.host;
});


Sources.allow({
  insert: function(userId, doc) {
    return true;
  },
  update: function(userId, doc, fieldNames) {
    return isOwner(userId, doc.ownerId) && (!_.contains(['owner', 'ownerId', 'createdAt'], fieldNames));
  },
  remove: function(userId, doc) {
    return isOwner(userId, doc.ownerId);
  }
});