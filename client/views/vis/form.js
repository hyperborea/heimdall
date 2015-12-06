Template.visForm.onRendered(function() {
  this.$('.ui.dropdown').dropdown();

  var form = this.$('.ui.form').form({});
});


Template.visForm.helpers({
  job: function() {
    return Jobs.findOne(this.jobId);
  },

  typeForm: function(job) {
    return (job && job.vis && job.vis.type) ? `vis${job.vis.type}Form` : null;
  },

  typeData: function(job) {
    if (job) {
      return {
        settings: job.vis,
        fields: job.result.fields
      };  
    }
  }
});


Template.visForm.events({
  'submit .ui.form': function(event, template) {
    event.preventDefault();

    var form = template.$('.ui.form').form({});
    var settings = $(event.target).serializeJSON();

    Meteor.call('saveJobVis', template.data.jobId, settings);
  }
});