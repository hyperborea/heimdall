Sources = new Mongo.Collection('sources');


Sources.before.insert(function (userId, doc) {
  var user = Meteor.users.findOne(userId);

  doc.createdAt = Date.now();
  doc.authorId = userId;
  doc.author = user.username;

  if (!doc.port) doc.port = '5432';
  if (!doc.name) doc.name = doc.host;
});


Sources.allow({
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