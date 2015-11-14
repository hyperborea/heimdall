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
    return isUser(userId);
  },
  update: function(userId, doc, fieldNames) {
    return isOwner(userId, doc.ownerId) && (!_.contains(['owner', 'ownerId', 'createdAt'], fieldNames));
  },
  remove: function(userId, doc) {
    return isOwner(userId, doc.ownerId);
  }
});


Meteor.methods({
  testSource: function(sourceId) {
    if (!Meteor.isServer) return;

    var source = Sources.findOne(sourceId);
    requireOwnership(this.userId, source.ownerId);

    function updateTest(result) {
      result.updatedAt = Date.now();
      Sources.update(sourceId, {$set: {test: result}});
    }

    updateTest({status: 'running'});
    queryPostgres(source, 'select now()', updateTest);
  }
});