Template.visualization.helpers({
  templateName: function() {
    const context = Template.currentData();
    const result = context.result;

    const templateMapping = {
      error   : 'visualizationError',
      running : 'visualizationRunning',
      ok      : 'vis' + context.visType
    };
    
    return result && templateMapping[result.status];
  },

  visData: function() {
    const context = Template.currentData();
    return _.extend(context.result || {}, {
      settings: context.vis
    });
  }
});


Template.visualizationRunning.events({
  'click .js-cancel': function(event, template) {
    Meteor.call('cancelJob', template.data.jobId);
  }
});