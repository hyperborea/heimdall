Sources = new Mongo.Collection('sources');


Sources.before.insert(function (userId, doc) {
  var user = Meteor.users.findOne(userId);

  doc.createdAt = Date.now();
  doc.userId = userId;
  doc.username = user.username;
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