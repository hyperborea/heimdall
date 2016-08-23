Dashboards = new Mongo.Collection('dashboards');

Meteor.startup(function() {
  if (!Meteor.isServer) return;
  Dashboards._ensureIndex({ title: 1 });
});


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


Meteor.methods({
  getDashboardTags: function() {
    var cursor = Dashboards.find(filterByAccess(this.userId), { fields: { tags: 1 } });

    return _.chain(cursor.fetch())
      .pluck('tags')
      .flatten()
      .compact()
      .uniq()
      .sortBy((x) => x)
      .value();
  }
});