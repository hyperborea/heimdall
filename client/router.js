FlowRouter.route('/', {
  name: 'home',
  action: () => FlowRouter.go('dashboardList')
});


FlowRouter.triggers.enter([function(context) {
  Meteor.call('logRequest', {
    path      : context.path,
    routeName : context.route.name,
    params    : context.params
  });
}]);