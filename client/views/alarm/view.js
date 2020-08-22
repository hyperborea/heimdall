Template.alarmView.onCreated(function () {
  this.subscribe("jobAlarmsForRun", this.data.jobId, this.data.runId);
});

Template.alarmView.helpers({
  job: function () {
    return Jobs.findOne(this.jobId);
  },

  alarms: function () {
    return JobAlarms.find({ runId: this.runId });
  },
});
