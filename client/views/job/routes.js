var jobRoutes = FlowRouter.group({
  prefix: '/jobs',
  subscriptions: function() {
    this.register('jobs', Meteor.subscribe('jobs'));
  }
});

jobRoutes.route('/', {
  name: 'jobList',
  action: render('jobList')
});

jobRoutes.route('/new', {
  name: 'jobNew',
  action: render('jobForm')
});

jobRoutes.route('/:id/edit', {
  name: 'jobEdit',
  action: render('jobForm')
});

jobRoutes.route('/:id', {
  name: 'jobView',
  action: render('jobView')
});