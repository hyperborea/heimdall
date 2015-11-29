Template.visualization.helpers({
  templateName: function() {
    const context = Template.currentData();
    const result = context.result;

    if (result) {
      switch (result.status) {
        case false:
          return undefined
        case 'error':
          return 'visualizationError';
        default:
          return _.isArray(result.data) && 'vis' + (context.visType || (context.vis && context.vis.type) || 'DataTable')
      }
    }
  },

  isRunning: function() {
    var data = Template.currentData();
    return (data && data.result && data.result.status === 'running') ? 'loading' : false;
  },

  visData: function() {
    const context = Template.currentData();
    return _.extend(context.result || {}, {
      settings: context.vis
    });
  }
});


Template.visualization.events({
  'click .js-run': function(event, template) {
    Meteor.call('runJob', template.data.result.jobId);
  },

  'click .js-download': function(event, template) {
    window.open(`/jobs/${template.data.result.jobId}/download`);
  },

  'click .js-edit-vis': function(event, template) {
    FlowRouter.go('jobView', { id: template.data.result.jobId });
  },

  'click .js-cancel': function(event, template) {
    Meteor.call('cancelJob', template.data.result.jobId);
  }
});