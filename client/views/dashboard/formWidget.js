Template.dashboardFormWidget.onCreated(function() {
  this.subscribe('jobs');
});


Template.dashboardFormWidget.onRendered(function() {
  this.$('.ui.dropdown').dropdown();

  this.autorun(() => {
    Jobs.find().fetch(); // rerun reactively
    this.$('.ui.dropdown').dropdown('set selected', this.data.jobId);  
  });
});


Template.dashboardFormWidget.helpers({
  jobs: function() {
    return Jobs.find();
  }
});