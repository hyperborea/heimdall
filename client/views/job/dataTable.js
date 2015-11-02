Template.jobDataTable.helpers({
  templateName: function() {
    var templateMapping = {
      error: 'jobDataTableError',
      running: 'jobDataTableRunning',
      ok: 'jobDataTableOK'
    }

    return this.object && templateMapping[this.object.status];
  }
});


Template.jobDataTableOK.helpers({
  dataKeys: function() {
    return (this.object && this.object.data) ? _.keys(this.object.data[0]) : [];
  },
  getField: function(row, key) {
    return row[key];
  }
});


Template.jobDataTableRunning.events({
  'click .js-cancel': function(event, template) {
    Meteor.call('cancelJob', this.object.jobId);
  }
});