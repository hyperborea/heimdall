Template.visForm.onCreated(function() {
  this.subscribe('jobs');
  
  this.selectedType = new ReactiveVar();
});


Template.visForm.onRendered(function() {
  var template = this;
  template.$('select').dropdown();

  var form = template.$('.ui.form').form({});
  var job = Jobs.findOne(template.data.jobId);

  if (job) {
    form.form('set values', job.vis);  
  }
});


Template.visForm.helpers({
  typeForm: function() {
    var selectedType = Template.instance().selectedType.get();
    return selectedType ? `vis${selectedType}Form` : null;
  },

  typeData: function() {
    var job = Jobs.findOne(this.jobId);
    if (job) {
      return {
        settings: job.vis,
        fields: job.result.fields
      };  
    }
  }
});


Template.visForm.events({
  'change [name=type]': function(event, template) {
    template.selectedType.set(event.target.value)
  },

  'submit .ui.form': function(event, template) {
    event.preventDefault();

    var form = template.$('.ui.form').form({});
    var settings = $(event.target).form('get values');
    if (settings.columns) settings.columns = settings.columns.split(',');

    console.log(settings);
    Meteor.call('saveJobVis', template.data.jobId, settings);
  }
});