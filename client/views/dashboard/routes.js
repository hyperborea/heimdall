var dashboardRoutes = FlowRouter.group({
  prefix: '/dashboards'
});

dashboardRoutes.route('/', {
  name: 'dashboardList',
  action: render('dashboardList')
});

dashboardRoutes.route('/new', {
  name: 'dashboardNew',
  action: render('dashboardForm')
});

dashboardRoutes.route('/:id/edit', {
  name: 'dashboardEdit',
  action: render('dashboardForm')
});