var alarmRoutes = FlowRouter.group({
  prefix: '/alarms'
});

alarmRoutes.route('/', {
  name: 'alarmList',
  action: render('alarmList')
});