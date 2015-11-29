Template.visForm.onRendered(function() {
  var template = this;
  template.$('.ui.dropdown').dropdown();

  var form = template.$('.ui.form').form({});

  this.autorun(() => {
    var job = Jobs.findOne(Template.currentData().jobId);
    if (job) {
      if (!isOwner(Meteor.user(), job)) {
        form.find('input').attr('readonly', '');
        form.find('.action.field').hide();
      }
    }
  });
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
    var settings = $(event.target).form('get values');
    if (settings.columns) settings.columns = settings.columns.split(',');

    Meteor.call('saveJobVis', template.data.jobId, settings);
  }
});