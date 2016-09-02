Dashboards = new Mongo.Collection('dashboards');

Meteor.startup(function() {
  if (!Meteor.isServer) return;
  Dashboards._ensureIndex({ title: 1 });
});


Meteor.methods({
  saveDashboard: function(data) {
    const user = Meteor.users.findOne(this.userId);

    var dashboardId = data._id;
    var doc = _.omit(data, '_id', 'owner', 'ownerId', 'createdAt');

    if (!dashboardId) {
      requireUser(this.userId);
      
      doc.createdAt = new Date();
      doc.ownerId = this.userId;
      doc.owner = user.username;

      dashboardId = Dashboards.insert(doc);
    }
    else {
      requireOwnership(user, Dashboards.findOne(dashboardId));
      Dashboards.update(dashboardId, {$set: doc});
    }

    return dashboardId;
  },

  removeDashboard: function(dashboardId) {
    check(dashboardId, String);
    requireOwnership(this.userId, Dashboards.findOne(dashboardId));

    Dashboards.remove(dashboardId);
  },

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