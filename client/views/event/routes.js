var eventRoutes = FlowRouter.group({
  prefix: '/events'
});

eventRoutes.route('/', {
  name: 'eventList',
  action: render('eventList')
});