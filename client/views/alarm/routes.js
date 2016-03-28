var alarmRoutes = FlowRouter.group({
  prefix: '/alarms'
});

alarmRoutes.route('/', {
  name: 'alarmList',
  action: render('alarmList')
});

alarmRoutes.route('/:jobId/:runId', {
  name: 'alarmView',
  action: render('alarmView')
});