Meteor.subscribe('groups');


FlowRouter.route('/', {
  name: 'home',
  action: () => FlowRouter.go('dashboardList')
});