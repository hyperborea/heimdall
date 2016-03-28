loadHandler(Template.alarmList);

Template.alarmList.onCreated(function() {
  this.autorun(() => {
    this.subscribe('jobAlarms', {
      showAck: Session.get('alarms.showAck')
    });
  });
});

Template.alarmList.onRendered(function() {
  this.$('input[name=showAck]').checkbox();
});

Template.alarmList.helpers({
  alarms: () => JobAlarms.find({}, {sort: {insertedAt: -1}}),
  showAck: () => Session.get('alarms.showAck'),
  hasItems: (alarms) => !Template.instance().subscriptionsReady() || alarms.count()
});

Template.alarmList.events({
  'change input[name=showAck]': function(event, template) {
    Session.set('alarms.showAck', event.target.checked);
  }
});