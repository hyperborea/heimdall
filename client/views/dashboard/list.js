loadHandler(Template.dashboardList);

Template.dashboardList.onCreated(function() {
  this.subscribe('dashboards');
});


Template.dashboardList.helpers({
  items: function() {
    var selector = {};

    if (Session.get('dashboardList.search'))
      selector['title'] = { $regex: Session.get('dashboardList.search'), $options: 'i' };
    if (Session.get('dashboardList.filterOwn'))
      selector['ownerId'] = Meteor.userId();

    return Dashboards.find(selector);
  },

  search: () => Session.get('dashboardList.search'),
  filterOwn: () => Session.get('dashboardList.filterOwn'),
  hasStarred: (_id) => hasStarred('dashboard', _id)
});


Template.dashboardList.events({
  'keyup, change input[name=search]': function(event) {
    Session.set('dashboardList.search', event.target.value);
  },

  'change input[name=filterOwn]': function(event) {
    Session.set('dashboardList.filterOwn', event.target.checked);
  }
});