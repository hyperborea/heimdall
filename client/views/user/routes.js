var userRoutes = FlowRouter.group({
  prefix: '/user'
});

userRoutes.route('/', {
  name: 'userOverview',
  action: render('userOverview')
});