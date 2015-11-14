Template.dashboardList.onCreated(function() {
  this.subscribe('dashboards');
});


Template.dashboardList.helpers({
  items: function() {
    return Dashboards.find();
  }
});