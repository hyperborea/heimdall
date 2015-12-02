loadHandler(Template.dashboardList);

Template.dashboardList.onCreated(function() {
  this.subscribe('dashboards');
});


Template.dashboardList.helpers({
  items: function() {
    return Dashboards.find();
  },

  hasStarred: function(_id) {
    return hasStarred('dashboard', _id);
  }
});