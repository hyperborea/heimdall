var jobRoutes = FlowRouter.group({
  prefix: '/jobs'
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