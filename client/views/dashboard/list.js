loadHandler(Template.dashboardList);

Template.dashboardList.onCreated(function() {
  this.subscribe('dashboards');
});


function dashboardFilter() {
  var selector = {};

  if (FlowRouter.getQueryParam('search'))
    selector['$or'] = [
      { title: { $regex: FlowRouter.getQueryParam('search'), $options: 'i' } },
      { tags: FlowRouter.getQueryParam('search') }
    ];
  if (FlowRouter.getQueryParam('filterOwn') === 'true')
    selector['ownerId'] = Meteor.userId();
  if (FlowRouter.getQueryParam('tag'))
    selector['tags'] = FlowRouter.getQueryParam('tag');
  
  return selector;
}


Template.dashboardList.helpers({
  dashboards: () => Dashboards.find(dashboardFilter()),
  starredDashboards: () => Dashboards.find(_.extend(dashboardFilter(), {
    _id: { $in: getStarred('dashboard', Meteor.userId()) }
  })),

  tags: () => _.chain(Dashboards.find().fetch())
    .pluck('tags')
    .flatten()
    .compact()
    .uniq()
    .sortBy((x) => x)
    .value(),

  search: () => Session.get('dashboardList.search'),
  filterOwn: () => Session.get('dashboardList.filterOwn'),

  tagLabelClass: (tag) => (FlowRouter.getQueryParam('tag') == tag) ? 'basic blue' : 'basic',
});


Template.dashboardList.events({
  'keyup, change input[name=search]': function(event) {
    FlowRouter.setQueryParams({ search: event.target.value });
  },

  'change input[name=filterOwn]': function(event) {
    FlowRouter.setQueryParams({ filterOwn: event.target.checked });
  },

  'click .js-select-tag': function(event, template) {
    FlowRouter.setQueryParams({ tag: event.target.dataset.value });
  }
});


Template.dashboardListItem.helpers({
  hasStarred: (dashboard) => hasStarred('dashboard', dashboard._id)
});