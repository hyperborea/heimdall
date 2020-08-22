Template.alarmItem.helpers({
  jobName: (alarm) => Jobs.findOne(alarm.jobId).name,
  isAcknowledged: (alarm) => alarm.status === "ack",
  iconClass: (level) => SEVERITIES[level].icon,

  rowKeys: (row) => _.keys(row),
  rowValue: (row, key) => row[key],

  isConditionKey: (rule, key) =>
    _.findWhere(rule.conditions, { field: key }) && "warning",
  prettyOperator: (op) => OPERATORS[op].display,
});

Template.alarmItem.events({
  "click .js-comment": function (event, template) {
    template.$(".comment.form").toggle();
    template.$("input[name=comment]").focus();
  },

  "submit .comment.form": function (event, template) {
    event.preventDefault();

    var input = template.find("input[name=comment]");
    Meteor.call("commentAlarm", template.data.alarm._id, input.value);
    input.value = "";
  },

  "click .js-delete-comment": function (event, template) {
    var data = Blaze.getData(event.target);

    confirmModal("Sure you want to delete this comment?", function () {
      Meteor.call("deleteAlarmComment", data.alarmId, data.comment.insertedAt);
    });
  },

  "click .js-ack-alarm": function (event, template) {
    var alarm = Blaze.getData(event.target).alarm;

    Meteor.call("acknowledgeAlarm", alarm._id);
  },
});

Template.alarmItemComment.helpers({
  isAuthor: (comment) => Meteor.userId() === comment.authorId,
});
