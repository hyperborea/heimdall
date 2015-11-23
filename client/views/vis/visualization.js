Template.visualization.helpers({
  templateName: function() {
    const context = Template.currentData();
    const result = context.result;

    switch (result && result.status) {
      case false:
        return undefined
      case 'error':
        return 'visualizationError';
      default:
        return _.isArray(result.data) && 'vis' + (context.visType || (context.vis && context.vis.type) || 'DataTable')
    }
  },

  isRunning: function() {
    return (Template.currentData().result.status === 'running') && 'loading';
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