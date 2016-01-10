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
  'click .js-ack-alarm': function(event, template) {
    var alarm = Blaze.getData(event.target).alarm;

    Meteor.call('acknowledgeAlarm', alarm._id);
  },

  'change input[name=showAck]': function(event, template) {
    Session.set('alarms.showAck', event.target.checked);
  }
});


Template.alarmListItem.helpers({
  jobName: (alarm) => Jobs.findOne(alarm.jobId).name,
  isAcknowledged: (alarm) => alarm.status === 'ack',
  iconClass: (level) => SEVERITIES[level].icon,

  rowKeys: (row) => _.keys(row),
  rowValue: (row, key) => row[key],

  isConditionKey: (rule, key) => _.findWhere(rule.conditions, {field: key}) && 'warning',
  prettyOperator: (op) => OPERATORS[op].display
});

Template.alarmListItem.events({
  'click .js-comment': function(event, template) {
    template.$('.comment.form').toggle();
    template.$('input[name=comment]').focus();
  },

  'submit .comment.form': function(event, template) {
    event.preventDefault();

    var input = template.find('input[name=comment]');
    Meteor.call('commentAlarm', template.data.alarm._id, input.value);
    input.value = '';
  },

  'click .js-delete-comment': function(event, template) {
    var data = Blaze.getData(event.target);

    if (confirm("Sure you want to delete this comment?")) {
      Meteor.call('deleteAlarmComment', data.alarmId, data.comment.insertedAt);
    }
  }
});


Template.alarmListItemComment.helpers({
  isAuthor: (comment) => Meteor.userId() === comment.authorId
});